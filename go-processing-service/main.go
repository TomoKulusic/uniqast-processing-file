package main

import (
	"os"
	"processing_service/logger"
	"processing_service/services"

	"github.com/nats-io/nats.go"
)

func main() {
	// ✅ Load NATS URL from environment variable
	natsURL := os.Getenv("NATS_URL")
	if natsURL == "" {
		natsURL = "nats://localhost:4222" // Default fallback
	}

	// ✅ Initialize NATS connection
	nc, err := nats.Connect(natsURL)
	if err != nil {
		logger.Log.Fatalf("Failed to connect to NATS: %v", err)
	}
	defer nc.Close()

	logger.Log.Infof("Connected to NATS at %s", natsURL)

	// ✅ Start listening for messages
	services.SubscribeToFileProcessing(nc)

	// Keep the service running
	select {}
}
