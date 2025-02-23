package services

import (
	"encoding/binary"
	"fmt"
	"os"
	"processing_service/logger"
	"processing_service/models"
)

// Parse an MP4 file and extract all boxes
func ParseMP4File(filePath string) ([]models.Box, error) {
	// Open the MP4 file
	file, err := os.Open(filePath)
	if err != nil {
		logger.Log.Errorf("Error opening file: %v", err)
		return nil, fmt.Errorf("error opening file: %v", err)
	}
	defer file.Close()

	var boxes []models.Box

	// Read MP4 boxes sequentially
	for {
		// Read the first 4 bytes (box size)
		sizeBuffer := make([]byte, 4)
		_, err := file.Read(sizeBuffer)
		if err != nil {
			logger.Log.Info("End of file reached.")
			break // End of file
		}

		// Convert size from bytes to an integer (Big Endian)
		boxSize := int(binary.BigEndian.Uint32(sizeBuffer))

		// Read the next 4 bytes (box type)
		typeBuffer := make([]byte, 4)
		_, err = file.Read(typeBuffer)
		if err != nil {
			logger.Log.Errorf("Error reading box type: %v", err)
			break
		}

		boxType := string(typeBuffer)

		// Calculate the remaining data size
		dataSize := boxSize - 8 // Subtract 8 because we've already read size & type

		// Read the box data
		boxData := make([]byte, dataSize)
		_, err = file.Read(boxData)
		if err != nil {
			logger.Log.Warnf("Error reading data for box %s: %v", boxType, err)
			break
		}

		// Store the box in a struct
		box := models.Box{
			Type: boxType,
			Size: boxSize,
			Data: boxData,
		}
		boxes = append(boxes, box)

		// Logging extracted box details
		logger.Log.Infof("Found Box: Type='%s', Size=%d bytes", box.Type, box.Size)
	}

	logger.Log.Info("MP4 Box Extraction Completed!")
	return boxes, nil
}

// Extract `ftyp` and `moov` boxes from parsed MP4 data
func ExtractFtypAndMoov(boxes []models.Box) (*models.Box, *models.Box) {
	var ftypBox, moovBox *models.Box

	for _, box := range boxes {
		if box.Type == "ftyp" {
			ftypBox = &box
		} else if box.Type == "moov" {
			moovBox = &box
		}
	}

	if ftypBox == nil || moovBox == nil {
		logger.Log.Warn("Missing 'ftyp' or 'moov' box in MP4 file.")
	} else {
		logger.Log.Info("Successfully extracted 'ftyp' and 'moov' boxes.")
	}

	return ftypBox, moovBox
}
