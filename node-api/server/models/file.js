const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../connection').sequelize;

const File = sequelize.define('File', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fileName: { type: DataTypes.STRING, allowNull: false },
    filePath: { type: DataTypes.STRING, allowNull: false },
    processingStatus: { 
        type: DataTypes.ENUM('Processing', 'Failed', 'Successful'),
        defaultValue: 'Processing'
    },
    processedFilePath: { type: DataTypes.STRING, allowNull: true }
}, {
    tableName: 'File',
    timestamps: false
});

module.exports = File;