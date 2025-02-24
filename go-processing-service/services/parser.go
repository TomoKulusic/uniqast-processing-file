package services

import (
	"encoding/binary"
	"fmt"
	"os"
	"path/filepath"
	"processing_service/logger"
	"processing_service/models"
	"time"
)

// ParseMP4File parses an MP4 file and extracts 'ftyp' and 'moov' boxes only.
func ParseMP4File(filePath string) (bool, string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		logger.Log.Errorf("Error opening file: %v", err)
		return false, "", fmt.Errorf("error opening file: %v", err)
	}
	defer file.Close()

	var boxes []models.Box

	for {
		sizeBuffer := make([]byte, 4)
		_, err := file.Read(sizeBuffer)
		if err != nil {
			logger.Log.Info("End of file reached.")
			break
		}

		boxSize := int(binary.BigEndian.Uint32(sizeBuffer))

		typeBuffer := make([]byte, 4)
		_, err = file.Read(typeBuffer)
		if err != nil {
			logger.Log.Errorf("Error reading box type: %v", err)
			break
		}

		boxType := string(typeBuffer)
		dataSize := boxSize - 8

		boxData := make([]byte, dataSize)
		_, err = file.Read(boxData)
		if err != nil {
			logger.Log.Warnf("Error reading data for box %s: %v", boxType, err)
			break
		}

		box := models.Box{
			Type: boxType,
			Size: boxSize,
			Data: boxData,
		}
		boxes = append(boxes, box)
	}

	// Extract 'ftyp' and 'moov' boxes
	ftypBox, moovBox := ExtractFtypAndMoov(boxes)
	if ftypBox == nil || moovBox == nil {
		logger.Log.Error("Missing 'ftyp' or 'moov' box in MP4 file.")
		return false, "", fmt.Errorf("'ftyp' or 'moov' box missing")
	}

	// Save only the extracted boxes
	outputPath, err := SaveBoxesToMP4([]models.Box{*ftypBox, *moovBox}, filePath, os.Getenv("OUTPUT_PATH"))
	if err != nil {
		logger.Log.Errorf("Failed to save extracted boxes: %v", err)
		return false, "", err
	}

	return true, outputPath, nil
}

// ExtractFtypAndMoov extracts only 'ftyp' and 'moov' boxes.
func ExtractFtypAndMoov(boxes []models.Box) (*models.Box, *models.Box) {
	var ftypBox, moovBox *models.Box

	for _, box := range boxes {
		switch box.Type {
		case "ftyp":
			ftypBox = &box
		case "moov":
			moovBox = &box
		}
	}

	return ftypBox, moovBox
}

// SaveBoxesToMP4 saves the provided boxes to a new MP4 file with a date-based filename.
func SaveBoxesToMP4(boxes []models.Box, inputFilePath, outputDir string) (string, error) {
	if err := os.MkdirAll(outputDir, os.ModePerm); err != nil {
		logger.Log.Errorf("Failed to create output directory: %v", err)
		return "", err
	}

	currentDate := time.Now().Format("2006-01-02")
	originalFileName := filepath.Base(inputFilePath)
	fileNameWithoutExt := originalFileName[:len(originalFileName)-len(filepath.Ext(originalFileName))]

	outputFileName := fmt.Sprintf("%s-%s.mp4", currentDate, fileNameWithoutExt)
	outputPath := filepath.Join(outputDir, outputFileName)

	file, err := os.Create(outputPath)
	if err != nil {
		logger.Log.Errorf("Failed to create output file: %v", err)
		return "", err
	}
	defer file.Close()

	for _, box := range boxes {
		if err := writeBox(file, &box); err != nil {
			logger.Log.Errorf("Failed to write box data: %v", err)
			return "", err
		}
	}

	logger.Log.Infof("Successfully saved boxes to '%s'", outputPath)
	return outputPath, nil
}

// Helper function to write a single box to the file
func writeBox(file *os.File, box *models.Box) error {
	if err := binary.Write(file, binary.BigEndian, uint32(box.Size)); err != nil {
		return err
	}
	if _, err := file.WriteString(box.Type); err != nil {
		return err
	}
	_, err := file.Write(box.Data)
	return err
}
