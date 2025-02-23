const path = require("path");

module.exports = {
    NATS_CHANNELS: {
        PROCESS_FILE: "process.file",
        RESPONSE_FILE: "process.response"
    },
    DEFAULT_NATS_URL: process.env.NATS_URL || "nats://localhost:4222",
    PROCESSING_STATUSES: {
        PROCESSING: "Processing",
        SUCCESSFUL: "Successful",
        FAILED: "Failed"
    },
    OUTPUT_FOLDER: path.join(__dirname, "../../Files/Output"),
    HTTP_STATUS: {
        OK: 200,
        ACCEPTED: 202,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500,
    }
};
