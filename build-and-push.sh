#!/bin/sh
docker build --platform linux/amd64 -t ghcr.io/attalliayoub/geoip:latest . && \
docker push ghcr.io/attalliayoub/geoip:latest
