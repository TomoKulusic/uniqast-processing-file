package main

import (
	"fmt"
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

	// ✅ Console log indicating successful startup
	fmt.Println("✅ Processing Service is up and running, listening for NATS messages...")

	// Keep the service running
	select {}
}
