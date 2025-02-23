# Uniqast Processing File

This project contains a Node.js API server, a Golang processing service, NATS message broker, and a MySQL database setup using Docker Compose.

## 🚀 How to Run the Project

### ✅ Step 1: Clone the repository

```bash
git clone https://github.com/TomoKulusic/uniqast-processing-file.git
cd uniqast-processing-file
```

### ✅ Step 2: Start Docker Containers

This sets up your MySQL database and NATS broker, and installs Node.js and Golang dependencies:

```bash
docker-compose up --build
```

### ✅ Step 3: Run Services Manually

**Run Node.js API:**

Open a new terminal:

```bash
cd node-api
node src/api.js
```

**Run Golang Processing Service:**

Open another terminal:

```bash
cd go-processing-service
go run main.go
```

## Logs are located

Ensure all services run without errors. Logs can be monitored at:

- **Node.js logs:** `./logs`
- **Go logs:** `./logs`

## 🛠️ Stopping the Project

Stop and remove containers:

```bash
docker-compose down
```

- MySQL exposed on port `3306`
- NATS exposed on port `4222`
- Node.js API runs on port `3000`

## 📝 Author

- Tomislav Kulusic

