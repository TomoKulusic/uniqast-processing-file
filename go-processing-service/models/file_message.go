package models

// FileMessage represents the file processing request
type FileMessage struct {
	ID       int    `json:"id"`
	FileName string `json:"fileName"`
	FilePath string `json:"filePath"`
}
