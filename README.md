# Uniqast Processing File

This project contains a Node.js API server, a Golang processing service, a NATS message broker, and a MySQL database setup using Docker Compose. The setup supports both Docker and local development environments.

The purpose of this project is to extract ftyp and moov atom boxes form mp4 file and to store it as the mp4 file.

Additional things added:
- Docker
- Logs

## How to Run the Project

### Step 1: Clone the repository

```bash
git clone https://github.com/TomoKulusic/uniqast-processing-file.git
cd uniqast-processing-file
```

### Step 2: Start Docker Containers

This sets up your MySQL database, NATS broker, Node.js API, and Golang processing service:

```bash
docker-compose up --build
```

### Docker Run (Services run automatically)

Docker Compose will automatically build and run:

- MySQL Database
- NATS Broker
- Node.js API
- Golang Processing Service

## Input and Output Folders

- **Input files (MP4 videos):** `./Files/Mp4`
- **Output files (Processed MP4):** `./Files/Output`

These folders are used by both local and Docker environments.

## Testing the Application

A Postman collection (`uniqast-processing.postman_collection.json`) for testing the API endpoints is available in the root folder of the project.

### Make a POST request to process a file:

```json
POST http://localhost:3000/process-file
{
  "filePath": "sample-video.mp4"
}
```

### Verify output:

Check the processed output MP4 file in:

```
./Files/Output
```

## Stopping the Project

Stop and remove Docker containers:

```bash
docker-compose down
```

## Additional Information

- MySQL exposed on port `3306`
- NATS exposed on port `4222`
- Node.js API runs on port `3000`
- Golang service runs on port `8080`

## Logs

Logs are stored in:

- **Node.js logs:** `./node-api/logs`
- **Golang logs:** `./go-processing-service/logs`

## Author

- Tomislav Kulusic