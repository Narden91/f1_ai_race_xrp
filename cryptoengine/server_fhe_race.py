# ==========================================================
# server_fhe_race.py
# ----------------------------------------------------------
# Minimal FHE race simulation with automatic speed scaling
# ==========================================================

from openfhe import *
import numpy as np
import random
from dataclasses import dataclass
from typing import Dict, List, Tuple

# ----- Minimal logging -----
PRINT_LOG = True
def log(msg: str, car_id: str | None = None):
    if not PRINT_LOG:
        return
    prefix = "[FHE]"
    if car_id:
        prefix += f" [car:{car_id}]"
    print(prefix, msg)

# ==========================================================
# ----- CONFIGURATION -----
# ==========================================================
N = 10                     # Dimension of t and W
NUM_JUDGES = 5             # Number of judges participating
MIN_TI = 1                 # Minimum t-share per judge
MAX_TI = 999               # Maximum t-share (per judge limit)
A_ENTRY_MIN = 0            # Minimum A_k entry
A_ENTRY_MAX = 5            # Maximum A_k entry
PLAINTEXT_MODULUS = 4293918721
DEPTH = 3

# ==========================================================
# ----- BOUND CONSTANT (for normalization upper limit) -----
# ==========================================================
def bound_C(n: int = N, k: int = NUM_JUDGES,
            max_ti: int = MAX_TI, amax: int = A_ENTRY_MAX) -> int:
    """
    Conservative theoretical upper bound on S = tᵀ W t.
    This prevents overflow in FHE arithmetic.
    """
    return k * (n ** 3) * (amax ** 2) * (max_ti ** 2)

C_BOUND = bound_C()

# ==========================================================
# ----- EXPECTATION-BASED SPEED SCALING -----
# ==========================================================
def expected_S(n=N, k=NUM_JUDGES, amax=A_ENTRY_MAX, max_ti=MAX_TI):
    """
    Compute the expected (mean) plaintext value of S = tᵀ W t
    given the random generation model for t and W.

    This is purely analytical and helps derive a scaling factor
    (GAIN) so that average cars land around 250 km/h.
    """
    m = max_ti // k  # effective upper limit per judge’s share (e.g. 199)
    # ---- t statistics ----
    Et = k * (m + 1) / 2                         # mean of t_i
    Var_share = (m * m - 1) / 12                 # variance of one share
    Et2 = k * Var_share + Et * Et                # E[t_i²]
    # ---- A statistics ----
    EA = amax / 2                                # mean of A entries
    EA2 = amax * (2 * amax + 1) / 6              # E[A²]
    # ---- W statistics ----
    EW_diag = k * n * EA2                        # mean diagonal term
    EW_off = k * n * (EA ** 2)                   # mean off-diagonal term
    # ---- Expected S ----
    return n * EW_diag * Et2 + n * (n - 1) * EW_off * (Et ** 2)

# Expected value and normalization gain
E_S = expected_S()
GAIN = C_BOUND / (2.0 * E_S)  # Scale factor for avg 250 km/h

# For debugging: print scaling summary once at startup
log(f"Normalization setup: C_BOUND={C_BOUND:.3e}, "
    f"E[S]={E_S:.3e}, GAIN={GAIN:.3f}")

# ==========================================================
# ----- THRESHOLD FHE SETUP -----
# ==========================================================
@dataclass
class Judge:
    idx: int
    secret_key: PrivateKey

class FHEService:
    def __init__(self):
        log("Initializing BFV CryptoContext (threshold enabled) …")
        params = CCParamsBFVRNS()
        params.SetPlaintextModulus(PLAINTEXT_MODULUS)
        params.SetSecurityLevel(SecurityLevel.HEStd_128_classic)
        params.SetStandardDeviation(3.2)
        params.SetSecretKeyDist(UNIFORM_TERNARY) 
        params.SetMultiplicativeDepth(DEPTH)
        params.SetBatchSize(16)
        params.SetDigitSize(30)
        params.SetScalingModSize(60)
        params.SetThresholdNumOfParties(NUM_JUDGES)
        try:
            params.SetMultipartyMode(NOISE_FLOODING_MULTIPARTY)
        except Exception:
            pass

        self.cc = GenCryptoContext(params)
        for feat in (PKE, KEYSWITCH, LEVELEDSHE, ADVANCEDSHE, MULTIPARTY):
            self.cc.Enable(feat)

        # ---- Distributed key generation (NUM_JUDGES parties) ----
        log(f"Running distributed key generation ({NUM_JUDGES} judges) …")
        kps = [self.cc.KeyGen()]
        for _ in range(1, NUM_JUDGES):
            kps.append(self.cc.MultipartyKeyGen(kps[-1].publicKey))

        # ---- Aggregate relinearization keys ----
        em_list = [self.cc.KeySwitchGen(kps[0].secretKey, kps[0].secretKey)]
        for i in range(1, NUM_JUDGES):
            em_list.append(
                self.cc.MultiKeySwitchGen(kps[i].secretKey, kps[i].secretKey, em_list[0])
            )

        em_sum = em_list[0]
        for i in range(1, NUM_JUDGES):
            em_sum = self.cc.MultiAddEvalKeys(em_sum, em_list[i], kps[i].publicKey.GetKeyTag())

        eFin = em_sum  # final aggregated relinearization key
        self.cc.InsertEvalMultKey([eFin])
        self.pubkey = kps[-1].publicKey
        self.judges = [Judge(i, kps[i].secretKey) for i in range(NUM_JUDGES)]
        log("Threshold keys ready.")

    def enc_scalar(self, x: int):
        pt = self.cc.MakePackedPlaintext([int(x)])
        return self.cc.Encrypt(self.pubkey, pt)

    def enc_scalar_mod(self, x: int):
        P = int(self.cc.GetPlaintextModulus())
        return self.enc_scalar(x % P)

    def decrypt_scalar_mod(self, ct) -> int:
        log("Decrypting final scalar (threshold fusion) …")
        lead = self.cc.MultipartyDecryptLead([ct], self.judges[0].secret_key)
        mains = [self.cc.MultipartyDecryptMain([ct], j.secret_key) for j in self.judges[1:]]
        fused = self.cc.MultipartyDecryptFusion([lead[0]] + [m[0] for m in mains])
        fused.SetLength(1)
        val_bal = fused.GetPackedValue()[0]
        P = int(self.cc.GetPlaintextModulus())
        return val_bal % P

FHE = FHEService()

# ==========================================================
# ----- JUDGES’ ENCRYPTED CONTRIBUTIONS -----
# ==========================================================
def judge_generate_t_share_enc() -> List:
    # Each judge encrypts its random t_i share in [MIN_TI, MAX_TI//NUM_JUDGES]
    return [FHE.enc_scalar(random.randint(MIN_TI, MAX_TI // NUM_JUDGES))
            for _ in range(N)]

def judge_generate_Wk_enc() -> List[List]:
    # Each judge encrypts its contribution W_k = A_kᵀA_k
    Ak = np.random.randint(A_ENTRY_MIN, A_ENTRY_MAX + 1,
                           size=(N, N), dtype=np.int64)
    Wk = (Ak.T @ Ak).astype(np.int64)
    return [[FHE.enc_scalar(int(Wk[i, j])) for j in range(N)] for i in range(N)]

# ==========================================================
# ----- SERVER CIPHERTEXT STORAGE -----
# ==========================================================
@dataclass
class CarRecord:
    name: str
    t_ct: List
    W_ct: List[List]

CAR_DB: Dict[str, CarRecord] = {}
_car_seq = 0
def _new_car_id(name: str) -> str:
    global _car_seq
    _car_seq += 1
    return f"{name}-{_car_seq:04d}"

# ==========================================================
# ----- (1) CREATE A NEW CAR -----
# ==========================================================
def create_car(name: str) -> str:
    car_id = _new_car_id(name)
    log("Creating new car …", car_id)

    # Collect encrypted t-shares from judges and aggregate homomorphically
    log("Collecting encrypted t-shares from judges …", car_id)
    t_shares_ct = [judge_generate_t_share_enc() for _ in range(NUM_JUDGES)]

    t_ct = []
    for i in range(N):
        acc = t_shares_ct[0][i]
        for j in range(1, NUM_JUDGES):
            acc = FHE.cc.EvalAdd(acc, t_shares_ct[j][i])
        t_ct.append(acc)

    # Collect encrypted W_k matrices from all judges
    log("Collecting encrypted W_k from judges …", car_id)
    W_ct = [[FHE.enc_scalar(0) for _ in range(N)] for _ in range(N)]
    for _ in range(NUM_JUDGES):
        Wk_ct = judge_generate_Wk_enc()
        for i in range(N):
            for j in range(N):
                W_ct[i][j] = FHE.cc.EvalAdd(W_ct[i][j], Wk_ct[i][j])

    CAR_DB[car_id] = CarRecord(name=name, t_ct=t_ct, W_ct=W_ct)
    log("Car created (ciphertexts stored only).", car_id)
    return car_id

# ==========================================================
# ----- INTERNAL: ENC(S) = tᵀ W t -----
# ==========================================================
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

# ==========================================================
# ----- (2) COMPUTE CAR VELOCITY -----
# ==========================================================
def get_car_velocity_kmh(car_id: str) -> Tuple[float, float]:
    car = CAR_DB.get(car_id)
    if not car:
        raise KeyError(f"Unknown car_id: {car_id}")

    log("Computing velocity …", car_id)
    S_ct = _enc_quadratic_form(car, car_id)
    S_mod = FHE.decrypt_scalar_mod(S_ct)  # integer value mod plaintext modulus

    # ---- Scaled normalization ----
    S_norm = min(1.0, (S_mod / C_BOUND) * GAIN)
    velocity_kmh = 500.0 * S_norm

    log(f"Velocity computed: {velocity_kmh:.2f} km/h", car_id)
    return (S_norm, velocity_kmh)

# ==========================================================
# ----- (3) RACE WINNER EVALUATION -----
# ==========================================================
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

# ==========================================================
# ----- (4) TRAINING FUNCTION -----
# ==========================================================
def train_car_random_subset(
    car_id: str,
    indices: List[int],
    delta_max: int = 20,
    seed: int | None = None,
    return_delta_ct: bool = False,
):
    """
    Player-driven training with server-side random deltas on a subset of t.
    Keeps W unchanged and returns a new car_id (immutability).
    """
    car = CAR_DB.get(car_id)
    if not car:
        raise KeyError(f"Unknown car_id: {car_id}")

    seen = set()
    clean_indices = []
    for idx in indices:
        if not (0 <= idx < N):
            raise IndexError(f"index {idx} out of bounds [0, {N-1}]")
        if idx not in seen:
            clean_indices.append(idx)
            seen.add(idx)

    rng = random.Random(seed) if seed is not None else random
    deltas = [0] * N
    for idx in clean_indices:
        deltas[idx] = rng.randint(-delta_max, delta_max)

    delta_ct = [FHE.enc_scalar_mod(int(d)) for d in deltas]
    new_t_ct = [FHE.cc.EvalAdd(car.t_ct[i], delta_ct[i]) for i in range(N)]

    new_id = _new_car_id(car.name)
    CAR_DB[new_id] = CarRecord(
        name=car.name,
        t_ct=new_t_ct,
        W_ct=[row[:] for row in car.W_ct]
    )
    log(f"Training applied to indices {clean_indices} (hidden deltas). New car created.", new_id)

    if return_delta_ct:
        return new_id, delta_ct
    return new_id