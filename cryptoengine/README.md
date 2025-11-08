# F1-AI: Privacy-Preserving Race Simulation with FHE

## Overview

A **Formula 1 race simulation** system that uses **Fully Homomorphic Encryption (FHE)** to compute car velocities while keeping all car characteristics encrypted. The system enables:

- 🔒 **Complete Privacy**: Car characteristics remain encrypted throughout computation
- 👥 **Multi-Party Trust**: 5 judges collaboratively generate encrypted car data
- ⚡ **Homomorphic Speed Calculation**: Compute velocities without decrypting data
- 🔐 **Threshold Decryption**: All judges must collaborate to reveal results
- 🏎️ **Training System**: Improve cars through encrypted parameter adjustments

> **📚 For detailed explanations of all concepts, mathematics, and implementations, see [EXPLANATION.md](./EXPLANATION.md)**

---

## Quick Start

### Installation

```bash
# Install dependencies
pip install openfhe numpy

# Run the simulation
python main.py
```

### Basic Usage

```python
from server_fhe_race import create_car, get_car_velocity_kmh, race_winner, train_car_random_subset

# Create cars (judges generate encrypted characteristics)
car1 = create_car("Ferrari")
car2 = create_car("McLaren")
car3 = create_car("Mercedes")

# Get velocities (homomorphic computation + threshold decryption)
velocity1 = get_car_velocity_kmh(car1)  # e.g., (0.52, 260.0) -> 260 km/h
velocity2 = get_car_velocity_kmh(car2)  # e.g., (0.78, 390.0) -> 390 km/h

# Run a race
results = race_winner([car1, car2, car3])
print(f"Winner: {results['winner']['name']} at {results['winner']['velocity_kmh']:.1f} km/h")

# Train a car (encrypted parameter updates)
car1_v2 = train_car_random_subset(car1, indices=[0, 2, 5, 7], delta_max=25)
new_velocity = get_car_velocity_kmh(car1_v2)  # Improved!
```

---

## Table of Contents

1. [What This Does](#what-this-does)
2. [Core Concepts](#core-concepts)
3. [System Architecture](#system-architecture)
4. [Key Functions](#key-functions)
5. [Configuration](#configuration)
6. [Security Guarantees](#security-guarantees)
7. [Documentation](#documentation)

---

## What This Does

### The Race Simulation

This system simulates F1 races where:

1. **Car Creation**: 5 judges collectively generate encrypted car characteristics (vector **t**) and performance matrix (**W**)
2. **Speed Calculation**: Server computes velocity using the formula `S = t^T W t` **on encrypted data**
3. **Racing**: Compare multiple cars to determine winners
4. **Training**: Modify car parameters through encrypted updates to improve performance

### Why FHE?

**Traditional approach**: Server sees all data (car specs, performance metrics)  
**FHE approach**: Server computes on encrypted data, never seeing actual values

**Result**: Privacy-preserving computation where no single party learns sensitive information!

---

## Core Concepts

### 1. Fully Homomorphic Encryption (BFV Scheme)

The system uses OpenFHE's **BFV scheme** which allows:

- ✅ Addition on encrypted data: `Enc(a) + Enc(b) = Enc(a + b)`
- ✅ Multiplication on encrypted data: `Enc(a) × Enc(b) = Enc(a × b)`
- ✅ Computing complex formulas without decryption

**See [EXPLANATION.md](./EXPLANATION.md#mathematical-background) for detailed mathematics**

### 2. Threshold Cryptography

Instead of one secret key, the system uses **distributed key generation**:

- Each judge holds a **key share** (sk₁, sk₂, sk₃, sk₄, sk₅)
- Public key derived from all shares combined
- **Decryption requires ALL 5 judges** to participate

**Security**: No single judge can decrypt alone!

### 3. The Quadratic Form: S = t^T W t

Car velocity is calculated from:

```
S = Σᵢ Σⱼ tᵢ · Wᵢⱼ · tⱼ
```

Where:

- **t**: 10-dimensional car characteristic vector (engine, aerodynamics, etc.)
- **W**: 10×10 performance matrix (how characteristics interact)
- **S**: Resulting score that determines velocity

**See [EXPLANATION.md](./EXPLANATION.md#the-quadratic-form-s--tt-w-t) for mathematical details**

---

## System Architecture

```
┌─────────────┐
│   Judges    │ (5 independent parties)
│  (k=1..5)   │
└──────┬──────┘
       │ Each generates:
       │ • t_share (encrypted)
       │ • W_k matrix (encrypted)
       ↓
┌──────────────────┐
│  FHE Server      │
│  • Aggregates    │
│    encrypted     │
│    contributions │
│  • Computes      │
│    Enc(S)        │
│  • NEVER sees    │
│    plaintext!    │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ Threshold Decrypt│
│ • All 5 judges   │
│   collaborate    │
│ • Reveal velocity│
└──────────────────┘
```

**See [EXPLANATION.md](./EXPLANATION.md#system-architecture) for detailed workflow**

---

## Key Functions

### Creating Cars

```python
car_id = create_car(name: str) -> str
```

- **What it does**: Creates a new car with encrypted characteristics
- **Process**: 5 judges each contribute random encrypted values that are aggregated
- **Returns**: Unique car ID
- **Storage**: Only encrypted values stored (server never sees plaintext)

**See [EXPLANATION.md](./EXPLANATION.md#function-create_carname-str---str) for detailed explanation**

### Computing Velocity

```python
(S_norm, velocity_kmh) = get_car_velocity_kmh(car_id: str) -> Tuple[float, float]
```

- **What it does**: Computes car velocity through homomorphic evaluation
- **Process**:
  1. Computes `Enc(S) = Enc(t^T W t)` on encrypted data
  2. All judges collaborate to decrypt S
  3. Normalizes to velocity (0-500 km/h range)
- **Returns**: Normalized score and velocity in km/h

**See [EXPLANATION.md](./EXPLANATION.md#function-get_car_velocity_kmhcar_id-str---tuplefloat-float) for mathematical details**

### Racing

```python
results = race_winner(car_ids: List[str]) -> Dict
```

- **What it does**: Evaluates multiple cars and determines the winner
- **Returns**: Dictionary with winner and full leaderboard

**Example output:**

```python
{
    "winner": {"car_id": "Ferrari-0003", "name": "Ferrari", "velocity_kmh": 390.0},
    "leaderboard": [...]  # All cars sorted by velocity
}
```

### Training

```python
new_car_id = train_car_random_subset(
    car_id: str,
    indices: List[int],          # Which components to modify (0-9)
    delta_max: int = 20,         # Maximum change per component
    seed: int | None = None      # For reproducibility
) -> str
```

- **What it does**: "Trains" a car by modifying specific encrypted parameters
- **Process**: Applies random deltas to selected components of vector t
- **Immutability**: Creates new car (original unchanged)
- **Privacy**: Deltas are encrypted; server doesn't know actual changes

**See [EXPLANATION.md](./EXPLANATION.md#function-train_car_random_subset) for training strategies**

---

## Configuration

### System Parameters

```python
N = 10                      # Dimension of car vector and matrix
NUM_JUDGES = 5              # Number of judges in threshold scheme
MIN_TI = 1                  # Minimum characteristic value
MAX_TI = 999                # Maximum characteristic value
A_ENTRY_MIN = 0             # Minimum matrix entry
A_ENTRY_MAX = 5             # Maximum matrix entry
PLAINTEXT_MODULUS = 4293918721  # ~4.3 billion (must be prime)
DEPTH = 3                   # Multiplicative depth for FHE operations
```

**See [EXPLANATION.md](./EXPLANATION.md#configuration-parameters) for detailed parameter explanations**

### Speed Scaling

The system automatically scales velocities to realistic ranges (0-500 km/h):

```python
C_BOUND = bound_C()         # Theoretical maximum of S
E_S = expected_S()          # Expected average value of S
GAIN = C_BOUND / (2.0 * E_S)  # Scaling factor

# Normalization formula:
S_norm = min(1.0, (S / C_BOUND) × GAIN)
velocity = 500.0 × S_norm    # Maps to [0, 500] km/h
```

**Average cars**: ~250 km/h  
**Exceptional cars**: up to 500 km/h

**See [EXPLANATION.md](./EXPLANATION.md#scaling-factor-gain) for mathematical derivation**

---

## Security Guarantees

### What's Private

✅ **Car characteristics (t)**: Never revealed, always encrypted  
✅ **Performance matrix (W)**: Generated distributedly, components hidden  
✅ **Individual judge contributions**: Other judges and server don't know  
✅ **Training deltas**: Encrypted modifications, server doesn't know changes  
✅ **Secret key**: Distributed across 5 judges, never materialized

### What's Public

❌ **Car names**: Known to all  
❌ **Final velocities**: Revealed after threshold decryption  
❌ **Number of cars**: Observable by all parties

### Security Model

**Threat Model**: Honest-but-curious

- Judges and server follow protocol correctly
- But they may try to learn sensitive information
- System prevents information leakage through cryptography

**Trust Requirement**: Must trust that **not all 5 judges collude**

- Any 4 or fewer judges: Learn nothing
- All 5 judges colluding: Can decrypt everything

**See [EXPLANATION.md](./EXPLANATION.md#security-model) for detailed security analysis**

---

## Documentation

### Complete Technical Documentation

For in-depth explanations including:

- FHE concepts for beginners
- Complete mathematical foundations
- Detailed function-by-function explanations
- Encryption algorithm mathematics
- Security proofs and guarantees
- Performance characteristics
- Implementation details

**👉 See [EXPLANATION.md](./EXPLANATION.md)**

### File Structure

```
F1-AI/
├── server_fhe_race.py      # Main implementation
├── EXPLANATION.md      # Detailed technical documentation
├── README.md               # This file (quick start guide)
├── game_gui.py             # (GUI implementation)
├── main.py                 # (Usage examples)
└── try.py                  # (Experimental code)
```

---

## Example: Complete Race Workflow

```python
from server_fhe_race import create_car, get_car_velocity_kmh, race_winner, train_car_random_subset

# 1. Create initial cars
print("Creating cars...")
ferrari = create_car("Ferrari")
mclaren = create_car("McLaren")
mercedes = create_car("Mercedes")

# 2. Initial race
print("\n=== Initial Race ===")
results = race_winner([ferrari, mclaren, mercedes])
for i, car_result in enumerate(results['leaderboard'], 1):
    print(f"{i}. {car_result['name']}: {car_result['velocity_kmh']:.1f} km/h")

# 3. Train the slowest car
slowest = results['leaderboard'][-1]['car_id']
print(f"\nTraining {results['leaderboard'][-1]['name']}...")
trained_car = train_car_random_subset(slowest, indices=[0,1,2,3,4], delta_max=30)

# 4. Re-race with trained car
print("\n=== After Training ===")
results2 = race_winner([ferrari, mclaren, trained_car])
for i, car_result in enumerate(results2['leaderboard'], 1):
    print(f"{i}. {car_result['name']}: {car_result['velocity_kmh']:.1f} km/h")

# 5. Show improvement
old_v = results['leaderboard'][-1]['velocity_kmh']
new_v = get_car_velocity_kmh(trained_car)[1]
print(f"\nImprovement: {old_v:.1f} → {new_v:.1f} km/h (+{new_v-old_v:.1f})")
```

---

## Advanced Topics

### Customizing Judges

The system uses a global `FHEService` with 5 judges. To modify:

```python
NUM_JUDGES = 7  # Increase security (more parties needed to collude)
# Reinitialize FHE = FHEService()
```

### Understanding the Math

The velocity formula `S = t^T W t` expands to:

```
S = t₀²·W₀₀ + t₀·t₁·W₀₁ + t₀·t₂·W₀₂ + ... + t₉²·W₉₉
```

This quadratic form captures:

- **Diagonal terms** (t²): Individual characteristic impacts
- **Cross terms** (tᵢ·tⱼ): Interaction between characteristics

**Example**: High engine power (t₀) + good aerodynamics (t₁) might have synergy (W₀₁)

**See [EXPLANATION.md](./EXPLANATION.md#why-this-form) for complete mathematical explanation**

### Performance Notes

**Computational costs** (approximate):

- Car creation: 0.5-2 seconds
- Velocity computation: 1-3 seconds
- Training: 0.1-0.5 seconds

**Scaling**:

- More cars: Linear cost (each independent)
- Larger N: Quadratic cost (N² matrix operations)
- More judges: Linear cost (more encryptions to aggregate)

**See [EXPLANATION.md](./EXPLANATION.md#performance-characteristics) for detailed analysis**

---

## Troubleshooting

### OpenFHE Installation Issues

If `pip install openfhe` fails:

1. Try building from source: https://github.com/openfheorg/openfhe-python
2. Check system requirements (C++17 compiler needed)
3. For Apple Silicon: May need Rosetta or arm64 build

### Import Errors

```python
ModuleNotFoundError: No module named 'openfhe'
```

**Solution**: Install OpenFHE or check virtual environment activation

### Decryption Failures

If velocities are incorrect or decryption fails:

- Check `PLAINTEXT_MODULUS` is prime
- Ensure `DEPTH` is sufficient (minimum 2 for quadratic form)
- Verify all judges participate in decryption

---

## References

### Key Papers

1. **BFV Scheme**: Brakerski-Fan-Vercauteren (2012) - "Fully Homomorphic Encryption without Bootstrapping"
2. **Threshold FHE**: Asharov et al. (2012) - "Multiparty Computation with Low Communication via Threshold FHE"
3. **OpenFHE**: Andrey Kim et al. (2023) - "OpenFHE: Open-Source Fully Homomorphic Encryption Library"

### Documentation

- **OpenFHE**: https://www.openfhe.org/
- **This Project**: [EXPLANATION.md](./EXPLANATION.md)

---

## License

MIT License (or your chosen license)

---

## Contributing

Contributions welcome! Please:

1. Read [EXPLANATION.md](./EXPLANATION.md) to understand the system
2. Open an issue to discuss proposed changes
3. Submit pull requests with clear descriptions

---

## Contact

For questions or issues:

- GitHub Issues: (your repository URL)
- Email: (your contact email)

---

**🎯 Ready to dive deeper? Read the complete technical documentation in [EXPLANATION.md](./EXPLANATION.md)!**

```
┌─────────────────────────────────────────────────────────┐
│                    System Architecture                   │
└─────────────────────────────────────────────────────────┘

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ Judge 0 │ │ Judge 1 │ │ Judge 2 │ │ Judge 3 │ │ Judge 4 │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     │           │           │           │           │
     └───────────┴───────────┴───────────┴───────────┘
                          │
                    ┌─────▼──────┐
                    │ Coordinator│
                    └─────┬──────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐    ┌─────▼──────┐   ┌────▼────┐
    │ Machine │    │   Speed    │   │Decryptor│
    │         │    │ Calculator │   │         │
    └─────────┘    └────────────┘   └─────────┘
```

---

## License

MIT License

---

## Contributors

- [Gabriele Lozupone/University of Cassino and Southern Lazio]

---
