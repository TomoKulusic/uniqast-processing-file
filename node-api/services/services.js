const File = require('../server/models/file.js');
const logger = require('../logger/logger.js');
const { PROCESSING_STATUSES } = require("../conifg/constants.js");

// Create a new file entry in DB
async function createFileEntry(fileName, filePath) {
    try {
        const file = await File.create({
            fileName,
            filePath,
            processingStatus: PROCESSING_STATUSES.PROCESSING,
            processedFilePath: null
        });
        logger.info(`File created in DB: ID=${file.id}, Name=${fileName}, Status=${PROCESSING_STATUSES.PROCESSING}`);
        return file;
    } catch (error) {
        logger.error(`Error creating file entry: ${error.message}`);
        throw error;
    }
}

// Fetch file by ID
async function getFileById(fileId) {
    try {
        return await File.findByPk(fileId);
    } catch (error) {
        logger.error(`Error fetching file ID=${fileId}: ${error.message}`);
        throw error;
    }
}

// Fetch all files
async function getAllFiles() {
    try {
        return await File.findAll();
    } catch (error) {
        logger.error(`Error fetching all files: ${error.message}`);
        throw error;
    }
}

// Update file status (Processing, Successful, Failed)
async function updateFileStatus(fileId, status, processedFilePath = null) {
    try {
        const file = await getFileById(fileId);
        if (!file) {
            logger.warn(`Cannot update status, file ID=${fileId} not found`);
            return null;
        }

        file.processingStatus = status;
        if (processedFilePath) {
            file.processedFilePath = processedFilePath;
        }
        await file.save();

        logger.info(`File ID=${fileId} updated: Status=${status}`);
        return file;
    } catch (error) {
        logger.error(`Error updating file ID=${fileId}: ${error.message}`);
        throw error;
    }
}

// Delete file entry
async function deleteFile(fileId) {
    try {
        const file = await getFileById(fileId);
        if (!file) {
            logger.warn(`Cannot delete, file ID=${fileId} not found`);
            return null;
        }

        await file.destroy();
        logger.info(`File ID=${fileId} deleted`);
        return true;
    } catch (error) {
        logger.error(`Error deleting file ID=${fileId}: ${error.message}`);
        throw error;
    }
}

module.exports = {
    createFileEntry,
    getFileById,
    getAllFiles,
    updateFileStatus,
    deleteFile
};
