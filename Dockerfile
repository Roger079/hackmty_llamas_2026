# ==========================================
# STAGE 1: Build React/Vite Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Python Runtime & Orchestrator
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend, static assets and SQLite database
COPY backend/ ./backend/
COPY static/ ./static/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Cloud Run injects the PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]
