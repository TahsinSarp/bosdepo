const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { sequelize, User, Message, GlobalSetting } = require('./models');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, you should restrict this to your netlify URL
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = process.env.PORT || 3001;
app.use(cors()); // In production, consider restricting this as well
app.use(express.json({ limit: '50mb' }));

// Static folder for uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// === REST Endpoints ===

// Initialize DB and Seed Base Users
app.get('/api/init', async (req, res) => {
    try {
        const adminExists = await User.findOne({ where: { nickname: 'Excer' } });
        if (!adminExists) {
            await User.bulkCreate([
                { nickname: 'Excer', rank: 'Admin', xp: 9999, password: 'Kabus99qwer.', mostUsedWord: 'Yönetim', badges: ['Kurucu', 'Her Şeyi Gören'] },
                { nickname: 'Sistem', rank: 'Üstün', xp: 9999, password: 'systempassword123', mostUsedWord: 'Düzen', badges: ['Kurucu'] },
                { nickname: 'Adept', rank: 'Part Lead', xp: 800, password: 'adeptpassword123', mostUsedWord: 'Sessizlik', badges: [] }
            ]);
        }

        // Seed system message if none exist
        const msgCount = await Message.count();
        if (msgCount === 0) {
            await Message.create({ author: 'Sistem', text: 'Ana Salona hoş geldiniz. Burası genel toplanma alanıdır.', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), isSystem: true });
        }

        res.json({ success: true, message: 'Database Initialized' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Login / Check User
app.post('/api/login', async (req, res) => {
    const { nickname, password } = req.body;
    const user = await User.findOne({ where: { nickname } });
    if (user) {
        if (user.password === password) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Ruhun şifresi uyuşmuyor.' });
        }
    } else {
        res.status(404).json({ error: 'Böyle bir ruh kayıtlı değil.' });
    }
});

// Register
app.post('/api/register', async (req, res) => {
    const { nickname, password, answers } = req.body;
    const existing = await User.findOne({ where: { nickname } });

    if (existing) {
        return res.status(400).json({ error: 'Bu isim zaten gölgelerde fısıldanıyor.' });
    }

    const newUser = await User.create({
        nickname, password, answers, xp: 0, rank: 'Aday', mostUsedWord: 'Sır', badges: ['İlk Adım']
    });

    res.json(newUser);
});

// Get all users
app.get('/api/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

// --- Settings API (Ranks) ---
app.get('/api/ranks', async (req, res) => {
    try {
        let settings = await GlobalSetting.findOne({ where: { key: 'availableRanks' } });
        if (!settings) {
            const defaultRanks = ['Aday', 'Üye', 'Part Lead', 'General Party Lead', 'Üstün', 'Admin'];
            settings = await GlobalSetting.create({ key: 'availableRanks', value: defaultRanks });
        }
        res.json(settings.value);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ranks', async (req, res) => {
    const { nickname, newRank } = req.body;
    if (nickname !== 'Excer') return res.status(403).json({ error: 'Sadece kurucu rütbe yaratabilir.' });

    try {
        const settings = await GlobalSetting.findOne({ where: { key: 'availableRanks' } });
        const currentRanks = settings ? settings.value : ['Aday', 'Üye', 'Part Lead', 'General Party Lead', 'Üstün', 'Admin'];

        if (!currentRanks.includes(newRank)) {
            const updatedRanks = [...currentRanks, newRank];
            if (settings) {
                await settings.update({ value: updatedRanks });
            } else {
                await GlobalSetting.create({ key: 'availableRanks', value: updatedRanks });
            }
            res.json(updatedRanks);
        } else {
            res.status(400).json({ error: 'Bu rütbe zaten mevcut.' });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update Profile
app.put('/api/users/:nickname', async (req, res) => {
    const { nickname } = req.params;
    const updates = req.body;

    try {
        await User.update(updates, { where: { nickname } });
        const user = await User.findOne({ where: { nickname } });

        // Broadcast user update
        io.emit('user_update', user);

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:nickname', async (req, res) => {
    const { nickname } = req.params;
    const { adminNickname } = req.body;

    if (nickname === 'Excer') return res.status(403).json({ error: 'Kurucu cemiyetten atılamaz.' });
    if (nickname === adminNickname) return res.status(403).json({ error: 'Kendinizi cemiyetten atamazsınız.' });

    try {
        const admin = await User.findOne({ where: { nickname: adminNickname } });
        if (!admin || admin.rank !== 'Admin') return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });

        await User.destroy({ where: { nickname } });
        io.emit('user_deleted', nickname);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Avatar
app.post('/api/users/:nickname/avatar', upload.single('avatar'), async (req, res) => {
    const { nickname } = req.params;

    if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi' });

    const avatarUrl = 'http://localhost:3001/uploads/' + req.file.filename;

    try {
        await User.update({ avatar: avatarUrl }, { where: { nickname } });
        const user = await User.findOne({ where: { nickname } });
        io.emit('user_update', user);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Messages
app.get('/api/messages', async (req, res) => {
    const messages = await Message.findAll({ order: [['id', 'ASC']] });
    res.json(messages);
});

// Clear Messages (Admin Only)
app.delete('/api/messages', async (req, res) => {
    try {
        await Message.destroy({ where: {} });
        io.emit('messages_cleared');
        res.json({ success: true, message: 'All messages cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Archives API ---
app.get('/api/archives', async (req, res) => {
    const { Archive } = require('./models');
    const archives = await Archive.findAll({ order: [['id', 'DESC']] });
    res.json(archives);
});

app.post('/api/archives', upload.single('archiveImage'), async (req, res) => {
    const { Archive } = require('./models');
    const { title, uploader } = req.body;

    if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi' });

    const imageUrl = 'http://localhost:3001/uploads/' + req.file.filename;

    try {
        const newArchive = await Archive.create({
            title,
            uploader,
            imageUrl
        });
        res.json(newArchive);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/archives/:id', async (req, res) => {
    const { Archive } = require('./models');
    try {
        const deleted = await Archive.destroy({ where: { id: req.params.id } });
        if (deleted) {
            res.json({ success: true, message: 'Arşiv kaydı silindi.' });
        } else {
            res.status(404).json({ error: 'Kayıt bulunamadı.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Theories API ---
app.get('/api/theories', async (req, res) => {
    const { Theory } = require('./models');
    const theories = await Theory.findAll({ order: [['id', 'DESC']] });
    res.json(theories);
});

app.post('/api/theories', async (req, res) => {
    const { Theory } = require('./models');
    const { title, content, author } = req.body;
    try {
        const newTheory = await Theory.create({ title, content, author });
        res.json(newTheory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/theories/:id/like', async (req, res) => {
    const { Theory } = require('./models');
    try {
        const theory = await Theory.findByPk(req.params.id);
        if (!theory) return res.status(404).json({ error: 'Not found' });
        theory.likes += 1;
        await theory.save();
        res.json(theory);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/theories/:id/reply', async (req, res) => {
    const { Theory } = require('./models');
    const { author, text } = req.body;
    try {
        const theory = await Theory.findByPk(req.params.id);
        if (!theory) return res.status(404).json({ error: 'Not found' });

        const currentReplies = theory.replyList || [];
        const newReply = { author, text, date: new Date().toISOString() };

        theory.replyList = [...currentReplies, newReply];
        theory.replies = theory.replyList.length;

        await theory.save();
        res.json(theory);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// === Socket.IO Chat Implementation ===

io.on('connection', (socket) => {
    console.log('A spirit connected:', socket.id);

    // User joins the chat
    socket.on('join_salon', (nickname) => {
        socket.join('ana_salon');
        console.log(`${nickname} joined Ana Salon`);
    });

    // Handle new message
    socket.on('send_message', async (data) => {
        try {
            // Save to database
            const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            const newMsg = await Message.create({
                author: data.author,
                text: data.text,
                time: timestamp,
                isSystem: false
            });

            // Award XP
            const user = await User.findOne({ where: { nickname: data.author } });
            if (user) {
                let newXp = user.xp + 10;
                let newRank = user.rank;

                const rankOrder = ['Aday', 'Üye', 'Part Lead', 'General Party Lead', 'Üstün', 'Admin'];
                const rankIndex = rankOrder.indexOf(user.rank);

                // Only progress if not Admin or if not already at the highest non-admin rank
                if (user.rank !== 'Admin') {
                    if (newXp >= 100 && rankIndex < 1) newRank = 'Üye';
                    if (newXp >= 500 && rankIndex < 2) newRank = 'Part Lead';
                    if (newXp >= 2000 && rankIndex < 3) newRank = 'General Party Lead';
                    if (newXp >= 5000 && rankIndex < 4) newRank = 'Üstün';
                }

                await user.update({ xp: newXp, rank: newRank });
                io.emit('user_update', user);
            }

            // Broadcast to everyone
            io.emit('receive_message', newMsg);
        } catch (err) {
            console.error("Error saving message:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('A spirit faded:', socket.id);
    });
});

// server starting logic
sequelize.sync({ alter: true }).then(() => {
    server.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);

        // Auto-init on start to be sure
        try {
            const { User } = require('./models');
            const adminExists = await User.findOne({ where: { nickname: 'Excer' } });
            if (!adminExists) {
                await User.bulkCreate([
                    { nickname: 'Excer', rank: 'Admin', xp: 9999, password: 'Kabus99qwer.', mostUsedWord: 'Yönetim', badges: ['Kurucu', 'Her Şeyi Gören'] },
                    { nickname: 'Sistem', rank: 'Üstün', xp: 9999, password: 'systempassword123', mostUsedWord: 'Düzen', badges: ['Kurucu'] }
                ]);
                console.log('Base users seeded.');
            } else if (adminExists.rank !== 'Admin' || adminExists.password !== 'Kabus99qwer.') {
                await adminExists.update({ rank: 'Admin', xp: 9999, password: 'Kabus99qwer.' });
                console.log('Excer restored to Admin rank and password updated.');
            }
        } catch (e) { console.error('Auto-seed failed', e); }
    });
});
