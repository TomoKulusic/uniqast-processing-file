# ---- Build Stage ----
    FROM golang:1.23-alpine AS build
    WORKDIR /usr/src/processor
    COPY go.mod go.sum ./
    RUN go mod download
    COPY . .
    RUN go build -o processor ./main.go
    
    # ---- Production Stage ----
    FROM alpine:latest
    WORKDIR /app
    COPY --from=build /usr/src/processor/processor /app/processor
    COPY --from=build /usr/src/processor/.env.docker /app/.env.docker
        
    ENV GIN_MODE=release
    CMD ["/app/processor"]
    