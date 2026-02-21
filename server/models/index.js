const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'dev.sqlite'),
    logging: false
});

// User Model
const User = sequelize.define('User', {
    nickname: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    rank: {
        type: DataTypes.STRING,
        defaultValue: 'Aday'
    },
    xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    joinDate: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    mostUsedWord: {
        type: DataTypes.STRING,
        defaultValue: 'Sır'
    },
    badges: {
        type: DataTypes.JSON, // Stores an array of badges
        defaultValue: ['İlk Adım']
    },
    answers: {
        type: DataTypes.JSON, // Store sign-up answers
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'hemsaye123'
    }
});

// Message Model
const Message = sequelize.define('Message', {
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Theory Model
const Theory = sequelize.define('Theory', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    replies: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    replyList: {
        type: DataTypes.JSON,
        defaultValue: []
    }
});

// Archive Model
const Archive = sequelize.define('Archive', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uploader: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    dateAdded: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    }
});

// Global Settings Model
const GlobalSetting = sequelize.define('GlobalSetting', {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.JSON,
        allowNull: false
    }
});

module.exports = {
    sequelize,
    User,
    Message,
    Theory,
    Archive,
    GlobalSetting
};
