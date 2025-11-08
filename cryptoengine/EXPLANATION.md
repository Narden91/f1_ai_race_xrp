# Fully Homomorphic Encryption (FHE) Race Simulation - Complete Explanation

## Table of Contents

1. [Introduction to FHE](#introduction-to-fhe)
2. [Mathematical Background](#mathematical-background)
3. [System Architecture](#system-architecture)
4. [Configuration Parameters](#configuration-parameters)
5. [Classes and Data Structures](#classes-and-data-structures)
6. [Core Functions](#core-functions)
7. [Workflow and Usage](#workflow-and-usage)

---

## Introduction to FHE

### What is Fully Homomorphic Encryption?

**Fully Homomorphic Encryption (FHE)** is a revolutionary cryptographic technique that allows computations to be performed directly on encrypted data without ever decrypting it. This means:

- **Privacy-Preserving Computation**: You can process sensitive data while it remains encrypted
- **Server-Side Processing**: A server can perform calculations on encrypted data without knowing what the data actually contains
- **Secure Multi-Party Computation**: Multiple parties can contribute encrypted data, and the server computes results without learning individual contributions

### The BFV Scheme

This implementation uses the **BFV (Brakerski-Fan-Vercauteren)** scheme, which is one of the most popular FHE schemes. BFV works with:

- **Ring Learning with Errors (RLWE)**: The security foundation based on the difficulty of solving polynomial ring problems
- **Plaintext Modulus**: A large prime number that defines the space for plaintext values
- **Ciphertext Modulus**: An even larger number for encrypted values
- **Polynomial Degree**: Determines the number of slots for batch operations

---

## Mathematical Background

### The Quadratic Form: S = t^T W t

At the heart of this race simulation is a **quadratic form** computation:

```
S = t^T W t = Σᵢ Σⱼ tᵢ · Wᵢⱼ · tⱼ
```

Where:

- **t** is an N-dimensional vector (represents car characteristics)
- **W** is an N×N symmetric positive semi-definite matrix (represents performance constraints)
- **S** is a scalar value (the "score" determining car velocity)

**Example with N=3:**

```
     [W₁₁  W₁₂  W₁₃]   [t₁]
S = [t₁ t₂ t₃] × [W₂₁  W₂₂  W₂₃] × [t₂]
     [W₃₁  W₃₂  W₃₃]   [t₃]

  = t₁²W₁₁ + t₁t₂W₁₂ + t₁t₃W₁₃ + t₂t₁W₂₁ + t₂²W₂₂ + t₂t₃W₂₃ + ...
```

### Why This Form?

1. **Positive Values**: When W is positive semi-definite, S ≥ 0, ensuring non-negative velocities
2. **Smooth Variations**: Small changes in t lead to predictable changes in S
3. **Rich Expressiveness**: Can model complex relationships between car parameters

### Multi-Party Secret Sharing

Each judge contributes:

- **t_share**: A piece of vector t (the sum of all shares = total t)
- **W_k = A_k^T A_k**: A symmetric positive semi-definite matrix contribution

The total is computed homomorphically:

```
t = Σₖ t_share_k    (sum of encrypted shares)
W = Σₖ W_k           (sum of encrypted matrices)
```

### Encryption Scheme Details

**Encryption of value m:**

```
Enc(m) = ct = (c₀, c₁)
where ct represents a polynomial in a cyclotomic ring
```

**Homomorphic Addition:**

```
Enc(m₁) + Enc(m₂) = Enc(m₁ + m₂)
Server can add: ct₁ ⊞ ct₂ = ct₃
```

**Homomorphic Multiplication:**

```
Enc(m₁) × Enc(m₂) = Enc(m₁ · m₂)
Server can multiply: ct₁ ⊠ ct₂ = ct₃
```

**Key Property**: The server performs operations on ciphertexts without knowing m₁ or m₂!

### Threshold Decryption

Instead of one party holding the complete secret key, it's distributed among NUM_JUDGES judges:

1. **Key Generation**: Each judge generates a key share sk_i
2. **Aggregation**: Public key is derived from combined shares
3. **Partial Decryption**: Each judge produces a partial decryption
4. **Fusion**: Combine partial decryptions to get final plaintext

**Security**: No single judge can decrypt alone; requires collaboration of all judges.

---

## System Architecture

### High-Level Flow

```
┌─────────────┐
│   Judges    │ (5 judges)
│  (k=1..5)   │
└──────┬──────┘
       │ Each generates:
       │ • t_share_k (encrypted)
       │ • W_k (encrypted matrix)
       ↓
┌──────────────────┐
│  FHE Server      │
│  • Aggregates    │
│    encrypted     │
│    contributions │
│  • Computes      │
│    Enc(S)        │
│  • Never sees    │
│    plaintext!    │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ Threshold Decrypt│
│ • All judges     │
│   collaborate    │
│ • Reveal S       │
└──────┬───────────┘
       │
       ↓
   Velocity = f(S)
```

---

## Configuration Parameters

### Core Settings

```python
N = 10  # Dimension of vectors/matrices
```

**Meaning**: The car characteristics vector t has 10 components, and W is a 10×10 matrix. Higher N = more expressiveness but slower computation.

```python
NUM_JUDGES = 5  # Number of participating judges
```

**Meaning**: The threshold scheme distributes trust across 5 judges. All must participate in decryption.

```python
MIN_TI = 1       # Minimum t-share value
MAX_TI = 999     # Maximum t-share value
```

**Meaning**: Each judge's contribution to t[i] is between 1 and 999/5 = 199. The total t[i] is roughly 1 to 999.

```python
A_ENTRY_MIN = 0  # Minimum value in matrix A_k
A_ENTRY_MAX = 5  # Maximum value in matrix A_k
```

**Meaning**: Each judge generates a random N×N matrix A_k with entries in [0,5], then computes W_k = A_k^T A_k.

```python
PLAINTEXT_MODULUS = 4293918721  # ~4.3 billion
```

**Meaning**: All arithmetic is done modulo this large prime. Must be large enough to prevent overflow but small enough for FHE efficiency.

```python
DEPTH = 3  # Multiplicative depth
```

**Meaning**: Maximum number of sequential multiplications allowed. Computing S = t^T W t requires depth 2 (t_i × t_j, then × W_ij).

### Bound Constant: C_BOUND

```python
def bound_C(n=N, k=NUM_JUDGES, max_ti=MAX_TI, amax=A_ENTRY_MAX) -> int:
    return k * (n ** 3) * (amax ** 2) * (max_ti ** 2)
```

**Mathematical Derivation:**

The maximum possible value of S = Σᵢ Σⱼ tᵢ · Wᵢⱼ · tⱼ occurs when all values are at their maximum:

- Each t_i ≤ k × max_ti (worst case: all judges contribute maximum)
- Each W_ij ≤ k × n × amax² (since W = Σₖ A_k^T A_k, and each A_k contributes n terms of size amax²)
- Each term tᵢ · Wᵢⱼ · tⱼ ≤ (k·max_ti)² × (k·n·amax²)
- There are n² such terms

**Upper bound:**

```
S ≤ n² × (k·max_ti)² × (k·n·amax²) = k³ · n³ · amax² · max_ti²
```

Conservative estimate: `C_BOUND = k · n³ · amax² · max_ti²` (slightly lower for safety)

**Example with default values:**

```
C_BOUND = 5 × 10³ × 5² × 999² = 5 × 1000 × 25 × 998001 ≈ 1.25 × 10¹¹
```

### Expected Value: E[S]

```python
def expected_S(n=N, k=NUM_JUDGES, amax=A_ENTRY_MAX, max_ti=MAX_TI):
    # Statistical calculation of E[t^T W t]
```

**Mathematical Expectation:**

Given random uniform distributions:

- t_i shares: uniform on [MIN_TI, max_ti/k]
- A entries: uniform on [0, amax]

**Step 1: Expected values of t_i**

```
E[t_share] = (MIN_TI + max_ti/k) / 2 ≈ (max_ti/k) / 2
E[t_i] = k × E[t_share] = k × (max_ti/k + 1) / 2
Var[t_share] = ((max_ti/k)² - 1) / 12
E[t_i²] = k × Var[t_share] + (E[t_i])²
```

**Step 2: Expected values of W_ij**

For diagonal terms (i=i):

```
W_ii = Σₖ Σₘ (A_k[m,i])²
E[W_ii] = k × n × E[A²] = k × n × amax(2·amax+1)/6
```

For off-diagonal terms (i≠j):

```
W_ij = Σₖ Σₘ A_k[m,i] × A_k[m,j]
E[W_ij] = k × n × E[A]² = k × n × (amax/2)²
```

**Step 3: Expected S**

```
E[S] = E[Σᵢ Σⱼ tᵢ·Wᵢⱼ·tⱼ]
     = Σᵢ E[tᵢ²]·E[W_ii] + Σᵢ≠ⱼ E[tᵢ]·E[tⱼ]·E[W_ij]
     = n × E[W_diag] × E[t²] + n(n-1) × E[W_off] × (E[t])²
```

### Scaling Factor: GAIN

```python
GAIN = C_BOUND / (2.0 * E_S)
```

**Purpose**: Scale the normalized S so that:

- Average car gets S_norm ≈ 0.5
- Average velocity ≈ 500 × 0.5 = 250 km/h
- Maximum velocity ≈ 500 km/h (when S approaches C_BOUND)

**Logic:**

```
S_norm = min(1.0, (S / C_BOUND) × GAIN)
velocity = 500 × S_norm
```

If S = E[S] (average case):

```
S_norm = (E[S] / C_BOUND) × GAIN
       = (E[S] / C_BOUND) × (C_BOUND / 2·E[S])
       = 0.5
velocity = 500 × 0.5 = 250 km/h ✓
```

---

## Classes and Data Structures

### Class: Judge

```python
@dataclass
class Judge:
    idx: int          # Judge identifier (0 to NUM_JUDGES-1)
    secret_key: PrivateKey  # This judge's share of the secret key
```

**Purpose**: Represents one participant in the threshold decryption scheme.

**Key Operations**:

- **Key Generation**: Each judge generates their key share during setup
- **Partial Decryption**: Provides their piece of the decryption puzzle
- **Security**: Holds a secret that should never be shared with the server or other judges

### Class: FHEService

```python
class FHEService:
    def __init__(self):
        # Sets up the entire FHE cryptographic context
```

The central cryptographic engine managing all FHE operations.

#### Attributes

```python
self.cc: CryptoContext  # The main FHE context from OpenFHE
```

**What it does**: Manages all cryptographic parameters, keys, and operations. Like a "calculator" for encrypted numbers.

```python
self.pubkey: PublicKey  # The aggregated public key
```

**What it does**: Used to encrypt new data. Can be shared publicly without security risk.

```python
self.judges: List[Judge]  # All judge objects with their key shares
```

**What it does**: Stores references to all judges for threshold decryption.

#### Method: `__init__(self)`

**Full Initialization Process:**

**Step 1: Create BFV Parameters**

```python
params = CCParamsBFVRNS()
```

Creates a parameter object for the BFV scheme with RNS (Residue Number System) optimization.

**Step 2: Configure Security Parameters**

```python
params.SetPlaintextModulus(PLAINTEXT_MODULUS)
```

- Sets the modulus for plaintext arithmetic
- Must be prime
- Larger = more range, but slower

```python
params.SetSecurityLevel(SecurityLevel.HEStd_128_classic)
```

- Ensures 128-bit security (equivalent to AES-128)
- Protects against known quantum and classical attacks

```python
params.SetStandardDeviation(3.2)
```

- Controls the "noise" added during encryption
- Noise is essential for security (makes patterns undetectable)
- Larger = more secure but less computation capacity

```python
params.SetSecretKeyDist(UNIFORM_TERNARY)
```

- Secret key coefficients are randomly chosen from {-1, 0, 1}
- Ternary distribution is efficient and secure

**Step 3: Set Computational Capabilities**

```python
params.SetMultiplicativeDepth(DEPTH)
```

- Maximum "depth" of multiplication operations
- Each multiplication adds noise; too much noise = decryption fails
- DEPTH=3 allows sequences like: a×b, then result×c, then result×d

```python
params.SetBatchSize(16)
```

- Number of values that can be packed into one ciphertext
- Enables SIMD (Single Instruction Multiple Data) operations
- Not heavily used in this code but available for optimization

**Step 4: Enable Threshold Multi-Party**

```python
params.SetThresholdNumOfParties(NUM_JUDGES)
```

- Configures the system for threshold decryption with NUM_JUDGES parties

```python
params.SetMultipartyMode(NOISE_FLOODING_MULTIPARTY)
```

- Security mode for multi-party computation
- "Noise flooding" adds extra randomness to prevent information leakage

**Step 5: Generate Crypto Context**

```python
self.cc = GenCryptoContext(params)
```

- Creates the actual FHE context with all configured parameters

**Step 6: Enable Features**

```python
for feat in (PKE, KEYSWITCH, LEVELEDSHE, ADVANCEDSHE, MULTIPARTY):
    self.cc.Enable(feat)
```

- **PKE**: Public Key Encryption - basic encrypt/decrypt
- **KEYSWITCH**: Allows changing encryption keys (needed for threshold)
- **LEVELEDSHE**: Leveled Somewhat Homomorphic Encryption - additions and limited multiplications
- **ADVANCEDSHE**: Advanced operations like rotations
- **MULTIPARTY**: Multi-party computation features

**Step 7: Distributed Key Generation**

```python
kps = [self.cc.KeyGen()]  # First judge generates initial key pair
for _ in range(1, NUM_JUDGES):
    kps.append(self.cc.MultipartyKeyGen(kps[-1].publicKey))
```

**How it works:**

1. Judge 0 generates a standard key pair (sk₀, pk₀)
2. Judge 1 generates their share based on pk₀ → (sk₁, pk₁)
3. Judge 2 generates their share based on pk₁ → (sk₂, pk₂)
4. ... continues until all judges have key shares
5. Final public key pk\_{NUM_JUDGES-1} is the aggregated public key

**Mathematical Foundation:**

```
pk = g^(sk₀ + sk₁ + ... + sk_{k-1}) mod p
```

The final public key represents the sum of all secret key shares.

**Step 8: Aggregate Relinearization Keys**

```python
em_list = [self.cc.KeySwitchGen(kps[0].secretKey, kps[0].secretKey)]
for i in range(1, NUM_JUDGES):
    em_list.append(
        self.cc.MultiKeySwitchGen(kps[i].secretKey, kps[i].secretKey, em_list[0])
    )
```

**What are relinearization keys?**

- When you multiply two ciphertexts, the result has a different form (it's "bigger")
- Relinearization converts it back to standard form
- Required for doing multiple sequential multiplications

**Why aggregate?**

- Each judge contributes their piece of the relinearization key
- The aggregated key works with the combined public key

```python
em_sum = em_list[0]
for i in range(1, NUM_JUDGES):
    em_sum = self.cc.MultiAddEvalKeys(em_sum, em_list[i], kps[i].publicKey.GetKeyTag())
```

Combines all relinearization key shares into one complete key.

```python
self.cc.InsertEvalMultKey([em_sum])
```

Registers the aggregated relinearization key with the context.

**Step 9: Store Results**

```python
self.pubkey = kps[-1].publicKey
self.judges = [Judge(i, kps[i].secretKey) for i in range(NUM_JUDGES)]
```

Saves the public key and judge information for later use.

#### Method: `enc_scalar(self, x: int)`

```python
def enc_scalar(self, x: int):
    pt = self.cc.MakePackedPlaintext([int(x)])
    return self.cc.Encrypt(self.pubkey, pt)
```

**Purpose**: Encrypts a single integer value.

**Process:**

1. **Create Plaintext**: `MakePackedPlaintext([x])` creates a plaintext object containing x
   - "Packed" means it could hold multiple values, but we only use one slot
2. **Encrypt**: `Encrypt(pubkey, pt)` encrypts the plaintext using the public key
   - Adds random noise for security
   - Returns a ciphertext that hides x completely

**Mathematical Representation:**

```
Enc(x) = ([a(s) + e + x]_q, a)
```

Where:

- s = secret key (polynomial)
- a = random polynomial
- e = small error polynomial (noise)
- q = ciphertext modulus
- [...]\_q = reduction modulo q

#### Method: `enc_scalar_mod(self, x: int)`

```python
def enc_scalar_mod(self, x: int):
    P = int(self.cc.GetPlaintextModulus())
    return self.enc_scalar(x % P)
```

**Purpose**: Encrypts an integer with automatic modular reduction.

**Why needed?**

- If x is negative or > PLAINTEXT_MODULUS, direct encryption could fail or behave unexpectedly
- `x % P` ensures x is in valid range [0, P-1]
- Handles negative numbers correctly (e.g., -5 % 100 = 95)

#### Method: `decrypt_scalar_mod(self, ct)`

```python
def decrypt_scalar_mod(self, ct) -> int:
    log("Decrypting final scalar (threshold fusion) …")
    lead = self.cc.MultipartyDecryptLead([ct], self.judges[0].secret_key)
    mains = [self.cc.MultipartyDecryptMain([ct], j.secret_key) for j in self.judges[1:]]
    fused = self.cc.MultipartyDecryptFusion([lead[0]] + [m[0] for m in mains])
    fused.SetLength(1)
    val_bal = fused.GetPackedValue()[0]
    P = int(self.cc.GetPlaintextModulus())
    return val_bal % P
```

**Purpose**: Decrypts a ciphertext using threshold decryption.

**Threshold Decryption Protocol:**

**Step 1: Lead Judge Partial Decryption**

```python
lead = self.cc.MultipartyDecryptLead([ct], self.judges[0].secret_key)
```

- Judge 0 performs the first partial decryption
- Uses their secret key share sk₀
- Result: partial decryption pd₀ (still not readable plaintext)

**Step 2: Other Judges Partial Decryptions**

```python
mains = [self.cc.MultipartyDecryptMain([ct], j.secret_key) for j in self.judges[1:]]
```

- Judges 1, 2, 3, 4 each perform their partial decryption
- Each uses their own secret key share sk_i
- Results: [pd₁, pd₂, pd₃, pd₄]

**Step 3: Fusion**

```python
fused = self.cc.MultipartyDecryptFusion([lead[0]] + [m[0] for m in mains])
```

- Combines all partial decryptions into the final plaintext
- Mathematical operation: aggregates contributions from all key shares

**Mathematical Foundation:**

```
Dec(ct) = Dec(ct, sk₀) ⊕ Dec(ct, sk₁) ⊕ ... ⊕ Dec(ct, sk_{k-1})
```

Where ⊕ represents a combining operation specific to the scheme.

**Step 4: Extract Value**

```python
fused.SetLength(1)  # We only packed one value
val_bal = fused.GetPackedValue()[0]  # Extract the first (only) value
return val_bal % P  # Ensure result is in [0, P-1]
```

**Security Guarantee**: No single judge can decrypt alone. All judges must participate.

---

### Data Class: CarRecord

```python
@dataclass
class CarRecord:
    name: str           # Human-readable car name (e.g., "Ferrari")
    t_ct: List          # Encrypted vector t (N ciphertexts)
    W_ct: List[List]    # Encrypted matrix W (N×N ciphertexts)
```

**Purpose**: Stores all encrypted information about a car.

**Important Property**: The server **never** sees the plaintext values of t or W. Everything is encrypted!

**Storage Structure:**

```python
CAR_DB: Dict[str, CarRecord] = {}  # car_id -> CarRecord mapping
```

A global dictionary storing all cars by their unique IDs.

---

## Core Functions

### Judge Contribution Functions

#### Function: `judge_generate_t_share_enc()`

```python
def judge_generate_t_share_enc() -> List:
    return [FHE.enc_scalar(random.randint(MIN_TI, MAX_TI // NUM_JUDGES))
            for _ in range(N)]
```

**Purpose**: A single judge generates their encrypted contribution to vector t.

**Process:**

1. For each dimension i ∈ [0, N-1]:
   - Generate random integer: `r_i ~ Uniform(MIN_TI, MAX_TI // NUM_JUDGES)`
   - Encrypt it: `ct_i = Enc(r_i)`
2. Return list of N ciphertexts: `[ct_0, ct_1, ..., ct_{N-1}]`

**Why divide by NUM_JUDGES?**

- Ensures the sum of all judges' contributions doesn't exceed MAX_TI
- Each judge contributes roughly 1/NUM_JUDGES of the total

**Example (N=3, NUM_JUDGES=5, MAX_TI=999):**

```
Judge generates: [Enc(45), Enc(123), Enc(87)]
Values 45, 123, 87 are each in range [1, 199]
```

#### Function: `judge_generate_Wk_enc()`

```python
def judge_generate_Wk_enc() -> List[List]:
    Ak = np.random.randint(A_ENTRY_MIN, A_ENTRY_MAX + 1,
                           size=(N, N), dtype=np.int64)
    Wk = (Ak.T @ Ak).astype(np.int64)
    return [[FHE.enc_scalar(int(Wk[i, j])) for j in range(N)] for i in range(N)]
```

**Purpose**: A single judge generates their encrypted contribution to matrix W.

**Process:**

**Step 1: Generate Random Matrix A_k**

```python
Ak = np.random.randint(A_ENTRY_MIN, A_ENTRY_MAX + 1, size=(N, N))
```

- Creates an N×N matrix with random integers in [A_ENTRY_MIN, A_ENTRY_MAX]
- Example (N=3, range=[0,5]):

```
Ak = [3  1  4]
     [0  2  5]
     [1  1  2]
```

**Step 2: Compute W_k = A_k^T × A_k**

```python
Wk = (Ak.T @ Ak).astype(np.int64)
```

- Matrix multiplication: transpose of A_k times A_k
- **Why this form?** Guarantees W_k is symmetric positive semi-definite
- Example:

```
      [3  0  1]   [3  1  4]   [10   6  17]
Wk =  [1  2  1] × [0  2  5] = [ 6   6  15]
      [4  5  2]   [1  1  2]   [17  15  45]
```

**Mathematical Property:**

```
For any vector v: v^T W_k v = v^T (A_k^T A_k) v = (A_k v)^T (A_k v) = ||A_k v||² ≥ 0
```

This ensures non-negative quadratic forms (important for positive velocities).

**Step 3: Encrypt Each Entry**

```python
return [[FHE.enc_scalar(int(Wk[i, j])) for j in range(N)] for i in range(N)]
```

- Creates N×N grid of ciphertexts
- Each entry W_k[i,j] is encrypted independently

**Result:**

```
[[Enc(10), Enc(6),  Enc(17)],
 [Enc(6),  Enc(6),  Enc(15)],
 [Enc(17), Enc(15), Enc(45)]]
```

---

### Car Management Functions

#### Function: `create_car(name: str) -> str`

```python
def create_car(name: str) -> str:
    car_id = _new_car_id(name)
    # ... (full implementation in code)
    return car_id
```

**Purpose**: Creates a new car with encrypted characteristics generated by judges.

**Full Process:**

**Step 1: Generate Unique Car ID**

```python
car_id = _new_car_id(name)  # e.g., "Ferrari-0001"
```

**Step 2: Collect Encrypted t-shares from All Judges**

```python
t_shares_ct = [judge_generate_t_share_enc() for _ in range(NUM_JUDGES)]
```

- Each judge generates their encrypted t-share
- Result: List of NUM_JUDGES lists, each containing N ciphertexts
- Structure: `[[Enc(t₀₀), Enc(t₀₁), ...], [Enc(t₁₀), Enc(t₁₁), ...], ...]`

**Step 3: Homomorphically Aggregate t-shares**

```python
t_ct = []
for i in range(N):
    acc = t_shares_ct[0][i]
    for j in range(1, NUM_JUDGES):
        acc = FHE.cc.EvalAdd(acc, t_shares_ct[j][i])
    t_ct.append(acc)
```

**What happens here:**

- For dimension i:
  - Start with judge 0's contribution: `acc = Enc(t₀ᵢ)`
  - Add judge 1's: `acc = Enc(t₀ᵢ) + Enc(t₁ᵢ) = Enc(t₀ᵢ + t₁ᵢ)`
  - Add judge 2's: `acc = Enc(t₀ᵢ + t₁ᵢ + t₂ᵢ)`
  - Continue for all judges...
  - Final: `t_ct[i] = Enc(t₀ᵢ + t₁ᵢ + ... + t₄ᵢ) = Enc(tᵢ)`

**Key Insight**: The server computes Enc(t) without ever seeing any individual t_share or the final t!

**Step 4: Collect Encrypted W_k Matrices**

```python
W_ct = [[FHE.enc_scalar(0) for _ in range(N)] for _ in range(N)]
for _ in range(NUM_JUDGES):
    Wk_ct = judge_generate_Wk_enc()
    for i in range(N):
        for j in range(N):
            W_ct[i][j] = FHE.cc.EvalAdd(W_ct[i][j], Wk_ct[i][j])
```

**What happens here:**

- Initialize W_ct as N×N grid of Enc(0)
- For each judge k:
  - Generate their W_k (encrypted)
  - Add each entry: `W_ct[i][j] += Wk_ct[i][j]`
- Final: `W_ct[i][j] = Enc(W₀[i,j] + W₁[i,j] + ... + W₄[i,j]) = Enc(W[i,j])`

**Step 5: Store Car Record**

```python
CAR_DB[car_id] = CarRecord(name=name, t_ct=t_ct, W_ct=W_ct)
```

**Security Summary:**

- ✅ Server knows: car exists, has encrypted t and W
- ❌ Server doesn't know: actual values of t or W
- ❌ Individual judges don't know: other judges' contributions or final values

#### Function: `_enc_quadratic_form(car: CarRecord, car_id: str)`

```python
def _enc_quadratic_form(car: CarRecord, car_id: str):
    log("Evaluating Enc(S) = tᵀ W t (homomorphic mult/add) …", car_id)
    S_ct = None
    for i in range(N):
        for j in range(N):
            tij = FHE.cc.EvalMult(car.t_ct[i], car.t_ct[j])
            term = FHE.cc.EvalMult(tij, car.W_ct[i][j])
            S_ct = term if S_ct is None else FHE.cc.EvalAdd(S_ct, term)
    log("Enc(S) ready.", car_id)
    return S_ct
```

**Purpose**: Computes Enc(S) = Enc(t^T W t) using only encrypted values.

**Algorithm Breakdown:**

**Goal**: Compute `S = Σᵢ Σⱼ tᵢ · Wᵢⱼ · tⱼ` in encrypted form.

**Iteration**: For each (i, j) pair where i,j ∈ [0, N-1]:

**Step 1: Multiply t_i × t_j**

```python
tij = FHE.cc.EvalMult(car.t_ct[i], car.t_ct[j])
```

- Homomorphic multiplication: `Enc(tᵢ) ⊠ Enc(tⱼ) = Enc(tᵢ · tⱼ)`
- Server computes product without knowing tᵢ or tⱼ

**Step 2: Multiply (t_i × t_j) × W_ij**

```python
term = FHE.cc.EvalMult(tij, car.W_ct[i][j])
```

- Another homomorphic multiplication: `Enc(tᵢ·tⱼ) ⊠ Enc(Wᵢⱼ) = Enc(tᵢ·tⱼ·Wᵢⱼ)`
- This is one term in the double sum

**Step 3: Accumulate All Terms**

```python
S_ct = term if S_ct is None else FHE.cc.EvalAdd(S_ct, term)
```

- First term: `S_ct = Enc(t₀·W₀₀·t₀)`
- Second term: `S_ct = Enc(t₀·W₀₀·t₀ + t₀·W₀₁·t₁)`
- Continue adding all N² terms...
- Final: `S_ct = Enc(Σᵢ Σⱼ tᵢ·Wᵢⱼ·tⱼ) = Enc(S)`

**Computational Complexity:**

- **Multiplications**: 2N² (depth = 2)
- **Additions**: N² - 1
- **Time**: O(N²) FHE operations

**Example Trace (N=2):**

```
i=0, j=0: term = Enc(t₀² · W₀₀)        → S_ct = Enc(t₀²·W₀₀)
i=0, j=1: term = Enc(t₀·t₁·W₀₁)        → S_ct = Enc(t₀²·W₀₀ + t₀·t₁·W₀₁)
i=1, j=0: term = Enc(t₁·t₀·W₁₀)        → S_ct = Enc(t₀²·W₀₀ + t₀·t₁·W₀₁ + t₁·t₀·W₁₀)
i=1, j=1: term = Enc(t₁²·W₁₁)          → S_ct = Enc(t₀²·W₀₀ + t₀·t₁·W₀₁ + t₁·t₀·W₁₀ + t₁²·W₁₁)
                                         = Enc(tᵀWt) ✓
```

#### Function: `get_car_velocity_kmh(car_id: str) -> Tuple[float, float]`

```python
def get_car_velocity_kmh(car_id: str) -> Tuple[float, float]:
    car = CAR_DB.get(car_id)
    if not car:
        raise KeyError(f"Unknown car_id: {car_id}")

    log("Computing velocity …", car_id)
    S_ct = _enc_quadratic_form(car, car_id)
    S_mod = FHE.decrypt_scalar_mod(S_ct)

    S_norm = min(1.0, (S_mod / C_BOUND) * GAIN)
    velocity_kmh = 500.0 * S_norm

    log(f"Velocity computed: {velocity_kmh:.2f} km/h", car_id)
    return (S_norm, velocity_kmh)
```

**Purpose**: Computes the car's velocity in km/h from its encrypted characteristics.

**Process:**

**Step 1: Retrieve Car**

```python
car = CAR_DB.get(car_id)
if not car:
    raise KeyError(f"Unknown car_id: {car_id}")
```

Looks up the car in the database; raises error if not found.

**Step 2: Compute Encrypted S**

```python
S_ct = _enc_quadratic_form(car, car_id)
```

Evaluates `Enc(S) = Enc(t^T W t)` homomorphically (as explained above).

**Step 3: Decrypt S (Threshold Decryption)**

```python
S_mod = FHE.decrypt_scalar_mod(S_ct)
```

- All judges collaborate to decrypt S
- Result: integer value of S (modulo plaintext modulus)

**Step 4: Normalize and Scale**

```python
S_norm = min(1.0, (S_mod / C_BOUND) * GAIN)
```

**Normalization Formula:**

```
S_norm = min(1, (S / C_BOUND) × GAIN)
```

**Logic:**

- `S / C_BOUND`: Gives fraction of theoretical maximum (in [0, ~1])
- `× GAIN`: Applies scaling to center around 0.5 for average cars
- `min(1.0, ...)`: Caps at 1.0 to prevent velocities > 500 km/h

**Step 5: Convert to Velocity**

```python
velocity_kmh = 500.0 * S_norm
```

- Linear mapping: S_norm ∈ [0, 1] → velocity ∈ [0, 500] km/h
- S_norm = 0.5 → 250 km/h (average)
- S_norm = 1.0 → 500 km/h (maximum)

**Return Values:**

- `S_norm`: Normalized score (for debugging/analysis)
- `velocity_kmh`: Final velocity in km/h

#### Function: `race_winner(car_ids: List[str])`

```python
def race_winner(car_ids: List[str]):
    log("Starting race evaluation …")
    results = []
    for cid in car_ids:
        log(f"Evaluating car {cid} …")
        S_norm, v = get_car_velocity_kmh(cid)
        results.append({
            "car_id": cid,
            "name": CAR_DB[cid].name,
            "S_norm": S_norm,
            "velocity_kmh": v
        })
    results.sort(key=lambda x: x["velocity_kmh"], reverse=True)
    log(f"Winner decided: {results[0]['car_id'] if results else 'N/A'}")
    return {"winner": results[0] if results else None, "leaderboard": results}
```

**Purpose**: Evaluates multiple cars and determines the race winner.

**Process:**

**Step 1: Evaluate Each Car**

```python
for cid in car_ids:
    S_norm, v = get_car_velocity_kmh(cid)
    results.append({...})
```

- Computes velocity for each car (involves FHE computation + threshold decryption)
- Stores results in a list of dictionaries

**Step 2: Sort by Velocity**

```python
results.sort(key=lambda x: x["velocity_kmh"], reverse=True)
```

- Descending order: highest velocity first
- Winner = results[0]

**Step 3: Return Results**

```python
return {"winner": results[0] if results else None, "leaderboard": results}
```

- **winner**: Dictionary with winner's details (or None if no cars)
- **leaderboard**: Full sorted list of all cars

**Example Output:**

```python
{
    "winner": {
        "car_id": "Ferrari-0003",
        "name": "Ferrari",
        "S_norm": 0.78,
        "velocity_kmh": 390.0
    },
    "leaderboard": [
        {"car_id": "Ferrari-0003", "name": "Ferrari", "S_norm": 0.78, "velocity_kmh": 390.0},
        {"car_id": "McLaren-0002", "name": "McLaren", "S_norm": 0.65, "velocity_kmh": 325.0},
        {"car_id": "Mercedes-0001", "name": "Mercedes", "S_norm": 0.52, "velocity_kmh": 260.0}
    ]
}
```

#### Function: `train_car_random_subset(...)`

```python
def train_car_random_subset(
    car_id: str,
    indices: List[int],
    delta_max: int = 20,
    seed: int | None = None,
    return_delta_ct: bool = False,
):
    # ... (full implementation in code)
```

**Purpose**: "Trains" a car by modifying specific components of its t vector using encrypted random deltas.

**Parameters:**

- **car_id**: The car to train
- **indices**: Which components of t to modify (e.g., [0, 3, 7])
- **delta_max**: Maximum absolute change per component (default: 20)
- **seed**: Random seed for reproducibility (optional)
- **return_delta_ct**: Whether to return the encrypted deltas (for debugging)

**Process:**

**Step 1: Validate Car Exists**

```python
car = CAR_DB.get(car_id)
if not car:
    raise KeyError(f"Unknown car_id: {car_id}")
```

**Step 2: Validate and Clean Indices**

```python
seen = set()
clean_indices = []
for idx in indices:
    if not (0 <= idx < N):
        raise IndexError(f"index {idx} out of bounds [0, {N-1}]")
    if idx not in seen:
        clean_indices.append(idx)
        seen.add(idx)
```

- Ensures all indices are valid (0 ≤ idx < N)
- Removes duplicates
- Example: [2, 5, 2, 9] → [2, 5, 9]

**Step 3: Generate Random Deltas**

```python
rng = random.Random(seed) if seed is not None else random
deltas = [0] * N
for idx in clean_indices:
    deltas[idx] = rng.randint(-delta_max, delta_max)
```

- Creates vector of deltas (mostly zeros)
- Only specified indices get non-zero deltas
- Deltas are random in [-delta_max, delta_max]

**Example (N=10, indices=[2,5,9], delta_max=20):**

```
deltas = [0, 0, -15, 0, 0, 8, 0, 0, 0, 12]
           ↑      ↑        ↑              ↑
           unchanged     modified      modified
```

**Step 4: Encrypt Deltas**

```python
delta_ct = [FHE.enc_scalar_mod(int(d)) for d in deltas]
```

- Encrypts each delta (including zeros)
- Uses modular encryption to handle negative values correctly

**Step 5: Apply Deltas Homomorphically**

```python
new_t_ct = [FHE.cc.EvalAdd(car.t_ct[i], delta_ct[i]) for i in range(N)]
```

- For each dimension i:
  - `new_t_ct[i] = Enc(t_i) ⊞ Enc(delta_i) = Enc(t_i + delta_i)`
- Server performs addition without knowing t_i or delta_i

**Mathematical Update:**

```
t'ᵢ = tᵢ + deltaᵢ   for all i ∈ [0, N-1]
```

**Step 6: Create New Car (Immutability)**

```python
new_id = _new_car_id(car.name)
CAR_DB[new_id] = CarRecord(
    name=car.name,
    t_ct=new_t_ct,
    W_ct=[row[:] for row in car.W_ct]  # Deep copy of W
)
```

**Why create new car?**

- **Immutability**: Original car remains unchanged
- **History Tracking**: Can compare before/after training
- **Parallel Experiments**: Train same car with different parameters

**Note**: W matrix stays the same (only t is modified).

**Step 7: Return Results**

```python
if return_delta_ct:
    return new_id, delta_ct
return new_id
```

**Training Strategy:**

**Exploration vs. Exploitation:**

- **Small delta_max** (e.g., 5-10): Fine-tuning, small improvements
- **Large delta_max** (e.g., 50-100): Exploration, big changes

**Targeted Training:**

- Modify few indices: Focus on specific characteristics
- Modify many indices: Broad changes across the board

**Iterative Improvement:**

```python
# Train, evaluate, repeat
car = create_car("Racer")
for round in range(10):
    v = get_car_velocity_kmh(car)[1]
    print(f"Round {round}: {v:.1f} km/h")
    car = train_car_random_subset(car, indices=[0,1,2,3], delta_max=15)
```

---

## Workflow and Usage

### Complete Race Simulation Example

```python
# 1. Initialize FHE system (automatic on import)
# FHE = FHEService() is created globally

# 2. Create cars
car1 = create_car("Ferrari")
car2 = create_car("McLaren")
car3 = create_car("Mercedes")
# Each car has unique encrypted t and W

# 3. Evaluate velocities
v1 = get_car_velocity_kmh(car1)[1]  # e.g., 245.3 km/h
v2 = get_car_velocity_kmh(car2)[1]  # e.g., 312.7 km/h
v3 = get_car_velocity_kmh(car3)[1]  # e.g., 198.9 km/h

# 4. Run race
result = race_winner([car1, car2, car3])
print(f"Winner: {result['winner']['name']} at {result['winner']['velocity_kmh']:.1f} km/h")
# Output: Winner: McLaren at 312.7 km/h

# 5. Train the slower car
car3_v2 = train_car_random_subset(car3, indices=[0, 2, 5, 7], delta_max=25)
new_velocity = get_car_velocity_kmh(car3_v2)[1]  # e.g., 278.4 km/h (improved!)

# 6. Re-race
result2 = race_winner([car1, car2, car3_v2])
```

### Privacy Guarantees

**What the server knows:**

- ✅ Number of cars
- ✅ Car names
- ✅ Final velocities (after threshold decryption)

**What the server doesn't know:**

- ❌ Individual t or W values
- ❌ Individual judges' contributions
- ❌ Intermediate values during computation
- ❌ Training deltas

**What judges know:**

- ✅ Their own contributions
- ✅ Final velocities (participate in decryption)

**What judges don't know:**

- ❌ Other judges' contributions
- ❌ Individual t or W values
- ❌ How final velocity relates to their contribution

### Performance Characteristics

**Computational Costs:**

- **Car Creation**: ~0.5-2 seconds (depends on hardware)

  - NUM_JUDGES × N encryptions for t
  - NUM_JUDGES × N² encryptions for W
  - Homomorphic aggregation

- **Velocity Computation**: ~1-3 seconds

  - 2N² homomorphic multiplications
  - N² homomorphic additions
  - Threshold decryption protocol

- **Training**: ~0.1-0.5 seconds
  - N encryptions for deltas
  - N homomorphic additions

**Scaling Considerations:**

- Larger N → more expressive but slower (quadratic cost)
- More judges → better security but slower key generation
- Higher depth → more complex operations but larger parameters

### Security Model

**Threat Model:**

**Honest-but-curious server:**

- Follows protocol correctly
- May try to learn plaintext from ciphertexts (prevented by FHE)

**Colluding judges:**

- If all judges collude, they can decrypt anything
- Threshold: requires ALL judges for decryption
- Alternative: Use (t,n)-threshold where only t of n judges needed

**External adversaries:**

- Cannot break FHE without secret keys (128-bit security)
- Cannot forge ciphertexts (authenticated encryption)

---

## Advanced Topics

### Why Quadratic Forms?

**Mathematical Properties:**

1. **Smoothness**: Small changes in t → smooth changes in S
2. **Non-negativity**: When W is PSD, S ≥ 0 always
3. **Expressiveness**: Can model complex relationships
4. **Differentiability**: Gradient ∇S = 2Wt (useful for ML training)

### Noise Management

**Noise Growth:**

- Each operation adds noise to ciphertexts
- Multiplication adds more noise than addition
- Too much noise → decryption fails

**Noise Budget:**

- Initial budget set by parameters
- Each multiplication consumes budget
- Depth parameter limits max multiplications

**Bootstrapping** (not used here):

- "Refreshes" ciphertext by re-encrypting
- Reduces noise, allows unlimited operations
- Very expensive computationally

### Extensions and Improvements

**Possible Enhancements:**

1. **Batch Operations**: Encrypt multiple values per ciphertext (SIMD)
2. **Sparse Matrices**: If W is sparse, skip zero entries
3. **Approximate Schemes**: Use CKKS for floating-point (trade exactness for efficiency)
4. **Gradient-Based Training**: Compute ∇S homomorphically for smart updates
5. **Privacy-Preserving Ranking**: Compare velocities without revealing values

---

## Conclusion

This FHE race simulation demonstrates:

✅ **Multi-party computation** with threshold cryptography  
✅ **Homomorphic evaluation** of quadratic forms  
✅ **Privacy-preserving** velocity computation  
✅ **Encrypted training** with server-side randomness

The system ensures that:

- No single party can decrypt alone
- The server computes on encrypted data without learning plaintexts
- Cars can be trained and evaluated while maintaining privacy

**Key Takeaway**: FHE enables computation on sensitive data while preserving privacy, opening possibilities for secure cloud computing, private machine learning, and confidential data analytics.

---

## Glossary

- **Ciphertext (ct)**: Encrypted data; hides plaintext value
- **Plaintext (pt)**: Original unencrypted data
- **Homomorphic**: Allows operations on encrypted data
- **Threshold Cryptography**: Requires multiple parties to decrypt
- **Quadratic Form**: Expression of form t^T W t
- **Positive Semi-Definite (PSD)**: Matrix where v^T W v ≥ 0 for all v
- **Multiplicative Depth**: Number of sequential multiplications allowed
- **Relinearization**: Converting expanded ciphertext back to standard form
- **Noise Flooding**: Adding extra noise to hide sensitive information
- **SIMD**: Single Instruction Multiple Data (batch operations)

---

_Document generated for F1-AI FHE Race Simulation_  
_OpenFHE Library - BFV Scheme with Threshold Multi-Party Computation_
