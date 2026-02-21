import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const ClanContext = createContext();
export const useClan = () => useContext(ClanContext);

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log("ClanContext: Using SOCKET_URL:", SOCKET_URL);
console.log("ClanContext: Using API_URL:", API_URL);

export const ClanProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('hemsayeUser');
        return saved ? JSON.parse(saved) : null;
    });

    const [users, setUsers] = useState({});
    const [messages, setMessages] = useState([]);
    const [customRanks, setCustomRanks] = useState(['Aday', 'Üye', 'Part Lead', 'General Party Lead', 'Üstün', 'Admin']);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState('');
    const [socket, setSocket] = useState(null);

    // 1. Initialize Backend DB (seeds base users if empty) and Socket
    useEffect(() => {
        const initBackend = async () => {
            try {
                await fetch(`${API_URL}/init`);
                fetchUsers();
                fetchMessages();
                fetchRanks();
            } catch (err) {
                console.error("Failed to connect to backend", err);
            }
        };

        initBackend();

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // 2. Fetch Initial Data
    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/users`);
            const data = await res.json();
            const usersMap = {};
            data.forEach(u => { usersMap[u.nickname] = u; });
            setUsers(usersMap);
        } catch (err) { console.error(err); }
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`${API_URL}/messages`);
            const data = await res.json();
            setMessages(data);
        } catch (err) { console.error(err); }
    };

    const fetchRanks = async () => {
        try {
            const res = await fetch(`${API_URL}/ranks`);
            const data = await res.json();
            setCustomRanks(data);
        } catch (err) { console.error(err); }
    };

    // 3. Socket Event Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (newMsg) => {
            setMessages(prev => [...prev, newMsg]);
        });

        socket.on('user_update', (updatedUser) => {
            setUsers(prev => ({ ...prev, [updatedUser.nickname]: updatedUser }));
            if (user && user.nickname === updatedUser.nickname) {
                setUser(updatedUser);
                localStorage.setItem('hemsayeUser', JSON.stringify(updatedUser));
            }
        });

        socket.on('user_deleted', (deletedNickname) => {
            setUsers(prev => {
                const newUsers = { ...prev };
                delete newUsers[deletedNickname];
                return newUsers;
            });
            if (user?.nickname === deletedNickname) {
                logout();
                notify("Cemiyetten aforoz edildiniz.");
            }
        });

        return () => {
            socket.off('receive_message');
            socket.off('user_update');
            socket.off('user_deleted');
        };
    }, [socket, user]);

    // Save logged in user session to local storage just for persistence across reloads
    useEffect(() => {
        if (user) {
            localStorage.setItem('hemsayeUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('hemsayeUser');
        }
    }, [user]);

    // API Actions
    const updateUserProfile = async (updates) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/users/${user.nickname}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            const updatedUser = await res.json();
            setUser(updatedUser);
        } catch (err) { console.error(err); }
    };

    const login = async (nickname, password, answers = null, isLoginAttempt = false) => {
        setError('');
        if (isLoginAttempt) {
            try {
                const res = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nickname, password })
                });
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || 'Giriş yapılamadı.');
                    return false;
                }
                const data = await res.json();
                setUser(data);
                if (socket) socket.emit('join_salon', data.nickname);
                return true;
            } catch (err) {
                setError('Sunucu bağlantısı kurulamadı.');
                return false;
            }
        }

        // Registration
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, password, answers })
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Kayıt yapılamadı.');
                return false;
            }
            const newUser = await res.json();
            setUser(newUser);
            if (socket) socket.emit('join_salon', newUser.nickname);
            return true;
        } catch (err) {
            setError('Sunucu bağlantısı kurulamadı.');
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    // Add XP is now handled backend-side primarily when chatting, but for manual tasks:
    const addXp = async (amount, targetNickname = null) => {
        const target = targetNickname || (user ? user.nickname : null);
        if (!target) return;
        const targetUser = users[target];
        if (!targetUser) return;

        try {
            await fetch(`${API_URL}/users/${target}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xp: targetUser.xp + amount }) // Note: Backend handles rank threshold logic ideally, but we'll let client pass xp up for now to hit the user_update broadcast
            });
        } catch (err) { console.error(err); }
    };

    const setRank = async (targetNickname, newRank) => {
        try {
            await fetch(`${API_URL}/users/${targetNickname}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rank: newRank })
            });
        } catch (err) { console.error(err); }
    };

    const addCustomRank = async (newRank) => {
        if (!user || user.nickname !== 'Excer') return;
        try {
            const res = await fetch(`${API_URL}/ranks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname: user.nickname, newRank })
            });
            if (res.ok) {
                const data = await res.json();
                setCustomRanks(data);
                notify(`Yeni rütbe fısıldandı: ${newRank}`);
                return true;
            } else {
                const data = await res.json();
                notify(data.error || "Rütbe eklenemedi.");
                return false;
            }
        } catch (err) { console.error(err); return false; }
    };

    const updateUserAsAdmin = async (targetNickname, updates) => {
        try {
            await fetch(`${API_URL}/users/${targetNickname}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) { console.error(err); }
    };

    const deleteUserAsAdmin = async (targetNickname) => {
        if (!user || user.rank !== 'Admin' || targetNickname === 'Excer' || targetNickname === user.nickname) return;
        try {
            const res = await fetch(`${API_URL}/users/${targetNickname}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNickname: user.nickname })
            });
            if (res.ok) {
                notify(`${targetNickname} cemiyetten aforoz edildi.`);
            }
        } catch (err) { console.error(err); }
    };

    const clearAllMessages = async () => {
        try {
            await fetch(`${API_URL}/messages`, { method: 'DELETE' });
            setMessages([]); // Optimistic local clear
        } catch (err) { console.error(err); }
    };

    const addMessage = (author, text) => {
        if (socket) {
            socket.emit('send_message', { author, text });
        }
    };

    const notify = (msg) => {
        setNotifications(prev => [...prev, msg]);
        setTimeout(() => {
            setNotifications(prev => prev.slice(1));
        }, 5000);
    };

    const canAccess = (requiredRank) => {
        if (!user) return false;
        if (user.rank === 'Admin' || user.nickname === 'Excer') return true;
        const ranks = ['Aday', 'Üye', 'Part Lead', 'General Party Lead', 'Üstün', 'Admin'];
        return ranks.indexOf(user.rank) >= ranks.indexOf(requiredRank);
    };

    return (
        <ClanContext.Provider value={{
            user, users, messages, error, notifications, customRanks,
            login, logout, addXp, setRank, canAccess, notify,
            updateUserProfile, updateUserAsAdmin, deleteUserAsAdmin, clearAllMessages,
            addMessage, socket, addCustomRank
        }}>
            {children}
        </ClanContext.Provider>
    );
};
