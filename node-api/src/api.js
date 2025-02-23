const express = require('express');
const { sendNATSRequest } = require('./natsHandler');
const { createFileEntry, getFileById, getAllFiles, deleteFile } = require('../services/services.js');
const path = require('path');
const logger = require('../logger/logger.js');
require('dotenv').config({ path: __dirname + '/../.env' });const { HTTP_STATUS } = require("../conifg/constants.js");

const app = express();
app.use(express.json());

// API to Request File Processing
app.post('/process-file', async (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Missing required filePath' });
        }

        console.log(filePath)

        // Extract file name and extension
        const fileName = path.basename(filePath, path.extname(filePath));
        const fileExtension = path.extname(filePath).toLowerCase();

        if (fileExtension !== '.mp4') {
            logger.warn(`Invalid file format: ${filePath}`);
            return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Only MP4 files are supported' });
        }

        // Store request in DB with "Processing" status
        const file = await createFileEntry(fileName, filePath);

        logger.info(`File record created: ID=${file.id}, Name=${fileName}, Status=Processing`);

        // Send NATS Request
        sendNATSRequest({ id: file.id, fileName, filePath });

        return res.status(HTTP_STATUS.ACCEPTED).json({ message: 'Processing request sent', fileId: file.id });
    } catch (error) {
        logger.error(`Error in API: ${error.message}`);
        return res.status(HTTP_STATUS.INTERNAL_ERROR).json({ error: 'Internal server error' });
    }
});

// Fetch all files
app.get('/files', async (req, res) => {
    const files = await getAllFiles();
    res.json(files);
});

// Fetch single file by ID
app.get('/files/:id', async (req, res) => {
    const file = await getFileById(req.params.id);
    if (!file) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'File not found' });
    res.json(file);
});

// Delete file by ID
app.delete('/files/:id', async (req, res) => {
    const deleted = await deleteFile(req.params.id);
    if (!deleted) return res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'File not found' });
    res.json({ message: 'File deleted' });
});

// Start API Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`API running on http://localhost:${PORT}`));
