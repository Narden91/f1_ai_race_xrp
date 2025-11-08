# F1 AI Race XRP

A blockchain-powered Formula 1 racing game that combines **Fully Homomorphic Encryption (FHE)** for privacy-preserving race simulations with **XRP Ledger** for cryptocurrency-based gameplay.

## 🏎️ Overview

This project merges cutting-edge cryptography with blockchain gaming to create a unique racing experience where:

- 🔒 **Car characteristics remain completely private** using FHE technology
- 💎 **Race outcomes are provably fair** through cryptographic computation
- 💰 **Real XRP transactions** power the game economy
- 🎮 **Players own, train, and race** virtual F1 cars as blockchain assets

## 🏗️ Project Structure

The project consists of two main components:

### 1. **CryptoEngine** - Privacy-Preserving Race Simulation

Located in `/cryptoengine/`

A sophisticated FHE-based race simulation system that:

- Uses OpenFHE's BFV scheme for homomorphic encryption
- Implements threshold cryptography with 5 judges for distributed trust
- Computes car velocities on encrypted data (formula: `S = t^T W t`)
- Enables privacy-preserving training of car characteristics

**Key Features:**

- Complete privacy of car specifications
- Multi-party computation without revealing sensitive data
- Encrypted parameter adjustments for car improvements
- Zero-knowledge race outcomes

[📚 Read CryptoEngine Documentation](./cryptoengine/README.md)

### 2. **WebApp** - XRP Ledger Gaming Platform

Located in `/webapp/`

A full-stack web application built with FastAPI and React that:

- Integrates XRP Ledger blockchain for transactions
- Provides wallet management with GemWallet integration
- Enables car creation, training, and racing with XRP payments
- Tracks transaction history and player garages

**Key Features:**

- Create and manage virtual F1 cars (costs XRP)
- Train cars to improve performance (costs XRP)
- Enter races and win XRP prizes
- Trade cars with refund mechanisms
- Real-time blockchain integration

[📚 Read WebApp Documentation](./webapp/README.md)

## 🚀 Quick Start

### Prerequisites

- **Python 3.x** with OpenFHE library
- **Docker & Docker Compose** (v20.10+)
- **XRP Testnet account** (for development)
- 2GB RAM minimum

### Running the CryptoEngine

```bash
cd cryptoengine

# Install dependencies
pip install openfhe numpy

# Run simulation
python main.py
```

### Running the WebApp

```bash
cd webapp

# Build and start containers
docker compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## 🎮 How It Works

### Race Simulation Flow

```
┌─────────────┐
│  5 Judges   │ → Generate encrypted car characteristics
└──────┬──────┘
       ↓
┌──────────────┐
│ FHE Engine   │ → Compute velocity on encrypted data
└──────┬───────┘
       ↓
┌──────────────┐
│   Decrypt    │ → All judges collaborate to reveal results
└──────┬───────┘
       ↓
┌──────────────┐
│ XRP Ledger   │ → Record transactions and distribute prizes
└──────────────┘
```

### Game Economy

1. **Create Car**: Pay XRP → Get encrypted car with random attributes
2. **Train Car**: Pay XRP → Improve specific characteristics (encrypted)
3. **Enter Race**: Pay XRP entry fee → Compete against others
4. **Win Prizes**: Top performers receive XRP rewards
5. **Sell Car**: Get partial XRP refund for unwanted cars

## 🔐 Security & Privacy

### Cryptographic Guarantees

- **Car specifications**: Never revealed, always encrypted
- **Performance calculations**: Computed homomorphically without decryption
- **Threshold decryption**: Requires all 5 judges to collaborate
- **No single point of failure**: Distributed trust model

### Blockchain Integration

- **Transparent transactions**: All XRP payments on public ledger
- **Wallet security**: User-controlled keys via GemWallet
- **Testnet safe**: Development on XRP Testnet

## 📊 Technology Stack

**Backend:**

- Python 3.x with FastAPI
- OpenFHE for Fully Homomorphic Encryption
- XRP Ledger SDK for blockchain integration

**Frontend:**

- React 18+ with Vite
- TailwindCSS for styling
- GemWallet for XRP integration
- Three.js for 3D race visualization

**Infrastructure:**

- Docker & Docker Compose
- RESTful API architecture
- WebSocket support for real-time updates

## 🛠️ Development

### Backend Development

```bash
# CryptoEngine
cd cryptoengine
python main.py  # Run examples

# WebApp Backend
docker compose exec backend bash
# Access backend container
```

### Frontend Development

```bash
cd webapp
docker compose logs -f frontend  # View frontend logs
docker compose exec frontend sh  # Access frontend container
```

## 📚 Documentation

- [CryptoEngine README](./cryptoengine/README.md) - FHE implementation details
- [CryptoEngine EXPLANATION](./cryptoengine/EXPLANATION.md) - Deep dive into mathematics
- [WebApp README](./webapp/README.md) - Full-stack app documentation
- [API Collection](./webapp/postman/) - Postman test collection

## 🎯 Use Cases

- **Privacy-Preserving Gaming**: Play competitively without revealing strategies
- **Blockchain Gaming**: Real cryptocurrency rewards and ownership
- **FHE Education**: Learn homomorphic encryption through practical application
- **Decentralized Trust**: Multi-party computation without central authority

## 🤝 Contributing

Contributions welcome! Please:

1. Read the documentation in both `/cryptoengine/` and `/webapp/`
2. Open an issue to discuss proposed changes
3. Submit pull requests with clear descriptions

## 📄 License

MIT License

## 👥 Contributors

- Emanuele Nardone / University of Cassino and Southern Lazio
- Gabriele Lozupone / University of Cassino and Southern Lazio

## 🔗 Resources

- **OpenFHE**: https://www.openfhe.org/
- **XRP Ledger**: https://xrpl.org/
- **GemWallet**: https://gemwallet.app/

---

**🏁 Ready to race? Start with the [CryptoEngine](./cryptoengine/README.md) to understand the privacy tech, then deploy the [WebApp](./webapp/README.md) to start playing!**
