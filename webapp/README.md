# F1 Pi Five XRP

A blockchain-powered F1 racing game built on XRP Ledger where players create, train, and race virtual cars using XRP cryptocurrency.

## Overview

This application integrates XRP Ledger blockchain technology with a gamified F1 racing experience. Users can:
- Create and manage virtual F1 cars as NFT-like assets
- Train cars to improve performance attributes
- Enter races and compete for XRP prizes
- Manage XRP wallets and transactions
- Trade cars with refund mechanisms

**Tech Stack:**
- **Backend**: FastAPI (Python 3.x) + XRP Ledger SDK
- **Frontend**: React + Vite + TailwindCSS + GemWallet integration
- **Infrastructure**: Docker + Docker Compose

## Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- XRP Testnet account (for development)

## Quick Start

### Build and Run

```bash
# Build containers
docker compose build

# Start application
docker compose up

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop application
docker compose down
```

### Access Points

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
f1-pi-five-xrp/
├── backend/                    # FastAPI application
│   ├── main.py                # Application entry point
│   ├── config.py              # Configuration settings
│   ├── models.py              # Pydantic data models
│   ├── requirements.txt       # Python dependencies
│   ├── routes/                # API endpoints
│   │   ├── health.py         # Health check
│   │   ├── wallet.py         # Wallet management
│   │   ├── payment.py        # XRP transactions
│   │   └── racing.py         # Racing game logic
│   └── services/              # Business logic
│       ├── wallet_service.py
│       ├── payment_service.py
│       └── racing_service.py
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   └── config/           # Frontend configuration
│   ├── package.json
│   └── vite.config.js
├── postman/                    # Postman API test collection
└── docker-compose.yml          # Container orchestration
```

## API Endpoints

**Wallet**
- `POST /wallet/create` - Create new XRP wallet
- `POST /wallet/import` - Import existing wallet
- `GET /wallet/{address}/balance` - Get wallet balance

**Racing**
- `POST /race/car/create` - Create new car (costs XRP)
- `GET /race/garage/{address}` - View owned cars
- `POST /race/train` - Train car attributes (costs XRP)
- `POST /race/test` - Test car speed
- `POST /race/enter` - Enter race (costs XRP, win prizes)
- `POST /race/car/sell` - Sell car for refund

**Payment**
- `POST /payment/send` - Send XRP payment
- `GET /payment/history/{address}` - Transaction history

## Development

```bash
# Rebuild after code changes
docker compose up --build

# Access backend container
docker compose exec backend bash

# Access frontend container
docker compose exec frontend sh

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
```

## Environment Variables

Backend supports:
- `NETWORK` - XRP network (default: testnet)
- `TESTNET_URL` - XRP Testnet JSON-RPC URL
- `TESTNET_WSS` - XRP Testnet WebSocket URL
- `DEBUG` - Debug mode (default: True)

