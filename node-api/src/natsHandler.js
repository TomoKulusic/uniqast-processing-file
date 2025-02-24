const nats = require("nats");
const path = require("path");
const logger = require("../logger/logger.js");
const { getFileById, updateFileStatus } = require("../services/services.js");
const { NATS_CHANNELS, DEFAULT_NATS_URL, PROCESSING_STATUSES } = require("../conifg/constants.js");

// Function to initialize NATS connection
async function connectToNATS() {
    const nc = await nats.connect({ servers: DEFAULT_NATS_URL });
    logger.info("Connected to NATS server");

    // Listen for NATS responses
    listenForResponses(nc);
    return nc;
}

// Function to Send NATS Request
async function sendNATSRequest(fileMessage) {
    const nc = await connectToNATS(); // Ensure connection before publishing
    nc.publish(NATS_CHANNELS.PROCESS_FILE, JSON.stringify(fileMessage));
    logger.info(`Sent NATS request for File ID: ${fileMessage.id}`);
}

// Function to Listen for NATS Responses
async function listenForResponses(nc) {
    const sub = nc.subscribe(NATS_CHANNELS.RESPONSE_FILE);

    logger.info(`Listening for NATS responses on "${NATS_CHANNELS.RESPONSE_FILE}"...`);

    for await (const msg of sub) {
        try {
            const response = JSON.parse(msg.data);
            const { id, success, message, filePath } = response;
            logger.info(`Received response for File ID: ${id}`);

            const file = await getFileById(id);
            if (!file) {
                logger.error(`File with ID ${id} not found.`);
                continue;
            }

            if (success && filePath) {
                file.processingStatus = PROCESSING_STATUSES.SUCCESSFUL;
                logger.info(`File ${id} processed successfully!`);

                await updateFileStatus(id, PROCESSING_STATUSES.SUCCESSFUL, filePath);
                logger.info(`Updated file status and stored output path: ${filePath}`);
            } else {
                await updateFileStatus(id, PROCESSING_STATUSES.FAILED);
                logger.warn(`Processing failed for file ID ${id}: ${message}`);
            }

            await file.save();
        } catch (err) {
            logger.error(`Error processing NATS message: ${err.message}`);
        }
    }
}

// Initialize NATS Connection at Startup
connectToNATS().catch(err => logger.error(`NATS Connection Error: ${err.message}`));

module.exports = { sendNATSRequest };
