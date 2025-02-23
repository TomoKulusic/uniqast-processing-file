package models

// ProcessedFileResponse represents the response sent back
type ProcessedFileResponse struct {
	ID      int     `json:"id"`
	Success bool    `json:"success"`
	Message string  `json:"message"`
	Boxes   *[]Box  `json:"boxes,omitempty"`
	Error   *string `json:"error,omitempty"`
}
