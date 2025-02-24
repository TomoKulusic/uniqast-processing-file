package services

import (
	"encoding/json"
	"sync"

	"processing_service/logger"
	"processing_service/models"

	"github.com/nats-io/nats.go"
)

// Worker Pool Configuration
const maxWorkers = 5 // Maximum concurrent file processing
var workerPool = make(chan struct{}, maxWorkers)
var wg sync.WaitGroup

// Subscribe to the NATS "process.file" topic (Concurrent Handling)
func SubscribeToFileProcessing(nc *nats.Conn) {
	_, err := nc.Subscribe("process.file", func(msg *nats.Msg) {
		// Run processing in a Goroutine
		wg.Add(1)
		go handleFileProcessing(nc, msg)
	})
	if err != nil {
		logger.Log.Fatalf("Failed to subscribe to 'process.file': %v", err)
	}

	logger.Log.Info("Listening for file processing requests on 'process.file'...")
}

// ✅ Handle file processing request (Runs in Goroutine)
func handleFileProcessing(nc *nats.Conn, msg *nats.Msg) {
	defer wg.Done() // Mark task as done

	// ✅ Acquire worker slot
	workerPool <- struct{}{}
	defer func() { <-workerPool }() // Release worker slot when done

	logger.Log.Info("Received file processing request...")

	var fileMsg models.FileMessage
	if err := json.Unmarshal(msg.Data, &fileMsg); err != nil {
		logger.Log.Error("Failed to parse message:", err)
		return
	}

	logger.Log.Infof("Processing file: %s (%s)", fileMsg.FileName, fileMsg.FilePath)

	// ✅ Call MP4 parser function
	success, outputPath, err := ParseMP4File(fileMsg.FilePath)
	if err != nil {
		logger.Log.Errorf("Error processing MP4 file: %v", err)
		sendNATSResponse(nc, fileMsg.ID, false, "Error processing file", "", err.Error())
		return
	}

	// ✅ Validate extracted boxes and send response
	if success {
		// Success: Both `ftyp` and `moov` are found
		sendNATSResponse(nc, fileMsg.ID, true, "Successfully extracted ftyp & moov", outputPath, "")
	} else {
		// Failure: One or both boxes are missing
		sendNATSResponse(nc, fileMsg.ID, false, "Missing ftyp or moov", "", "")
	}
}

// ✅ Function to send NATS response
func sendNATSResponse(nc *nats.Conn, id int, success bool, message string, filePath string, errorMessage string) {
	response := models.ProcessedFileResponse{
		ID:       id,
		Success:  success,
		Message:  message,
		FilePath: filePath,
	}

	// If there's an error, include it in the response
	if errorMessage != "" {
		response.Error = &errorMessage
	}

	// Encode response to JSON
	responseData, err := json.Marshal(response)
	if err != nil {
		logger.Log.Error("Failed to encode response:", err)
		return
	}

	// ✅ Publish response to "process.response"
	if err := nc.Publish("process.response", responseData); err != nil {
		logger.Log.Error("Failed to send NATS response:", err)
		return
	}

	logger.Log.Infof("Sent response to 'process.response' for file ID: %d", id)
}
