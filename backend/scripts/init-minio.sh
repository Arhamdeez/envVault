#!/bin/bash
# Initialize MinIO bucket (run after MinIO is up)

echo "Waiting for MinIO to be ready..."
sleep 5

mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/envvault --ignore-existing
mc anonymous set download local/envvault

echo "MinIO bucket 'envvault' initialized"

