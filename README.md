# GeoIP Service

![License](https://img.shields.io/badge/License-MIT-blue)

A high-performance, self-hosted GeoIP and Timezone service built with Rust and React. It provides automatic MaxMind database updates, robust API endpoints for IP detection and reverse lookups, and a modern web interface.

Demo: [https://geoip.quoi.dev/](https://geoip.quoi.dev/)

![Screenshot](/screenshot.png)

## Features

- **Blazing Fast**: Built with Rust and Axum for maximum performance and a low memory footprint.
- **Requester IP Detection**: Automatically detect and return the client's IP address.
- **GeoIP Lookups**: Resolve IP addresses to geographic locations using MaxMind databases.
- **Reverse GeoIP Lookups**: Search for IP network blocks by country or city name with prefix matching and configurable result limiting.
- **Multi-Edition Support**: Simultaneously serve multiple MaxMind database editions (City, ASN, etc.).
- **Automatic Updates**: Keeps MaxMind and Timezone databases up to date automatically.
- **Database Mirroring**: Serve MMDB and Timezone archives to other instances, reducing MaxMind API quota usage across your infrastructure.
- **Embedded Systems Friendly**: Exposes a list of timezone mappings to POSIX spec strings (`posix_timezone` computed from `timezone`).
- **Security**: Protect endpoints with API keys and secure the Web UI with Recaptcha v3.
- **Modern Web UI**: React-based frontend with OpenStreetMap integration, service status monitoring, and interactive GeoIP and Reverse lookups.
- **Developer Experience**: Includes an OpenAPI specification and Swagger UI out of the box.

## Quick Start

The easiest way to run the service is using Docker or Docker Compose.

### Using Docker Compose (Recommended)

1. Ensure you have the included `docker-compose.yml` file.
2. (Optional) Create a `.env` file in the same directory to store your MaxMind credentials:
   ```env
   MAXMIND_ACCOUNT_ID=your_account_id
   MAXMIND_LICENCE_KEY=your_license_key
   ```
3. Run the service in the background:
   ```shell
   docker-compose up -d
   ```

### Using Docker Run

```shell
docker run -d \
  --name geoip-service \
  -e MAXMIND_ACCOUNT_ID="your_account_id" \
  -e MAXMIND_LICENCE_KEY="your_license_key" \
  -e OSM_TILES_URL="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" \
  -v geoip_data:/data \
  -p 8080:8080 \
  ghcr.io/attalliayoub/geoip:latest
```

> **Note**: You can get a MaxMind account ID and license key for free [here](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data/).

After starting the container, you can access the Web UI and API at `http://localhost:8080/`.

## API Endpoints

The service exposes several robust endpoints. Swagger UI is available at `/swagger-ui` and the OpenAPI specification at `/api/docs`.

### Core
- `GET /api/status` - Query system status, including database versions and last update checks.
- `GET /api/ip` - Detect the requester's IP address.
- `GET /api/timezones` - Get all known timezone mappings from IDs to POSIX specifications. *(Can be protected with API key)*

### Lookups
- `GET /api/geoip` - Perform a standard GeoIP lookup for an IP address. *(Can be protected with API key)*
- `GET /api/geoip/reverse` - Perform a reverse GeoIP lookup to find network blocks by `country` or `city`. Supports partial name matching and result limiting (e.g., `?city=blid&limit=20`). *(Can be protected with API key)*

### File Serving
- `GET /files/mmdb/{edition}` - Download the latest MMDB database compressed as `tar.gz`. Supports the `If-Modified-Since` header. *(Can be protected with API key)*
- `GET /files/tzdata` - Download the latest Timezone database compressed as `tar.gz`. Supports the `If-Modified-Since` header. *(Can be protected with API key)*

## Configuration

The service is highly configurable via environment variables:

### Server & Storage
- `LISTEN_ADDR` - Socket address to bind the HTTP server. Defaults to `127.0.0.1:8080` (local) or `0.0.0.0:8080` (Docker).
- `DATA_DIR` - Directory for storing `.mmdb` files. Must be writable if auto-updates are enabled. Defaults to `/data` in Docker.

### MaxMind Integration
- `MAXMIND_ACCOUNT_ID` - MaxMind account ID for automatic updates.
- `MAXMIND_LICENCE_KEY` - MaxMind license key.
- `MAXMIND_EDITIONS` - Comma-separated editions to use (e.g., `GeoLite2-City,GeoLite2-ASN`). Defaults to `GeoLite2-City`.
- `MAXMIND_DOWNLOAD_URL` - Custom download URL. Use the `{edition}` placeholder. Defaults to MaxMind's official URL. Can point to another GeoIP instance.
- `MAXMIND_BEARER_TOKEN` - Bearer token for downloading databases from a protected custom URL.
- `AUTO_UPDATE_INTERVAL` - Auto-update interval in hours. Defaults to `24`.

*(Note: If `MAXMIND_ACCOUNT_ID` or `MAXMIND_DOWNLOAD_URL` are not set, automatic updates are disabled. You must manually place `{edition}-{datetime}.mmdb` files in the `DATA_DIR`.)*

### Timezone Updates
- `TZDATA_AUTO_UPDATE_INTERVAL` - Auto-update interval in hours. Set to `0` to disable. Defaults to `24`.
- `TZDATA_DOWNLOAD_URL` - Timezone database download URL. Defaults to IANA's official URL.
- `TZDATA_BEARER_TOKEN` - Bearer token for protected timezone download URLs.
- `ZIC_PATH` - Override path for the `zic` timezone compiler executable.

### Security & UI Integration
- `API_KEY` - Protect `/api/geoip`, `/api/geoip/reverse`, `/api/timezones`, and `/files/**` endpoints with a Bearer token.
- `RECAPTCHA_SITE_KEY` - Protect the Web UI lookup forms with Recaptcha v3.
- `RECAPTCHA_SECRET_KEY` - Required if `RECAPTCHA_SITE_KEY` is set.
- `OSM_TILES_URL` - Render OpenStreetMap maps on the Web UI. Example: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`.
- `GOOGLE_TAG_ID` - Enable Google Analytics integration in the Web UI.

## Building from Source

To compile the application locally, you will need **Rust** and **Node.js (with pnpm)** installed on your system.

```shell
# 1. Install frontend dependencies
npm i -g pnpm # if you don't have pnpm installed
pnpm install

# 2. Generate OpenAPI client types
pnpm openapi-ts # run this first time or after OpenAPI spec changes

# 3. Build the frontend assets
pnpm build

# 4. Build the Rust backend
cargo build --release
```

Alternatively, you can build the Docker image using the provided `Dockerfile`:
```shell
docker build -t geoip-service .
```

## Tech Stack

- **Backend**: Rust, Axum, Rusqlite (for Reverse Lookups)
- **Frontend**: TypeScript, React, TailwindCSS, DaisyUI, Rsbuild
- **Data**: MaxMind GeoLite2, IANA Timezone Database
- **API**: OpenAPI, Swagger UI

## License

MIT
