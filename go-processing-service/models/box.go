package models

// Box represents an MP4 box (atom)
type Box struct {
	Size int
	Type string
	Data []byte
}
