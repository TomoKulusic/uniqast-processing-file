const nats = require("nats");
const fs = require("fs");
const path = require("path");
const { File } = require("../server/connection.js");
const logger = require("../logger/logger.js");
const { getFileById, updateFileStatus } = require("../services/services.js");
const { NATS_CHANNELS, DEFAULT_NATS_URL, PROCESSING_STATUSES, OUTPUT_FOLDER } = require("../conifg/constants.js");

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
            const { id, success, message, boxes } = response;
            logger.info(`Received response for File ID: ${id}`);

            const file = await getFileById(id);
            if (!file) {
                logger.error(`File with ID ${id} not found.`);
                continue;
            }

            if (success) {
                file.processingStatus = PROCESSING_STATUSES.SUCCESSFUL;
                logger.info(`File ${id} processed successfully!`);

                if (!fs.existsSync(OUTPUT_FOLDER)) {
                    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
                }

                const outputFilePath = path.join(OUTPUT_FOLDER, `${file.fileName}.mp4`);

                if (boxes && boxes.length > 0) {
                    const formattedBoxes = boxes.map(box => {
                        const sizeBuffer = Buffer.alloc(4);
                        sizeBuffer.writeUInt32BE(box.Size, 0);
                        const typeBuffer = Buffer.alloc(4);
                        typeBuffer.write(box.Type, 0, "ascii");
                        const dataBuffer = Buffer.from(box.Data, "base64");

                        return Buffer.concat([sizeBuffer, typeBuffer, dataBuffer]);
                    });

                    const combinedData = Buffer.concat(formattedBoxes);
                    fs.writeFileSync(outputFilePath, combinedData);
                    logger.info(`File saved to: ${outputFilePath}`);
                }

                await updateFileStatus(id, PROCESSING_STATUSES.SUCCESSFUL, outputFilePath);
            } else {
                await updateFileStatus(id, PROCESSING_STATUSES.FAILED);
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
