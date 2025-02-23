-- Ensure the database exists
CREATE DATABASE IF NOT EXISTS uniqast;

-- Switch to the database
USE uniqast;

-- Create the File table if it does not exist
CREATE TABLE IF NOT EXISTS File (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    processingStatus ENUM('Processing', 'Failed', 'Successful') NOT NULL DEFAULT 'Processing',
    processedFilePath VARCHAR(255)
);
