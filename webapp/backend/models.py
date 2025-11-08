from pydantic import BaseModel, Field, validator
from typing import Optional

class WalletCreateRequest(BaseModel):
    seed: str = Field(default="", description="Optional seed for wallet import")
    
    @validator('seed')
    def validate_seed(cls, v):
        if v and len(v) < 10:
            raise ValueError('Seed must be at least 10 characters if provided')
        return v

class WalletResponse(BaseModel):
    address: str
    seed: str
    public_key: str
    
class BalanceResponse(BaseModel):
    address: str
    balance_xrp: float
    balance_drops: str
    
class PaymentRequest(BaseModel):
    sender_seed: str = Field(..., description="Sender wallet seed")
    destination: str = Field(..., description="Destination XRP address")
    amount: float = Field(..., gt=0, description="Amount in XRP (must be positive)")
    
    @validator('destination')
    def validate_destination(cls, v):
        if not v.startswith('r'):
            raise ValueError('Invalid XRP address format')
        if len(v) < 25 or len(v) > 35:
            raise ValueError('XRP address length invalid')
        return v

class PaymentResponse(BaseModel):
    status: str
    transaction_hash: Optional[str] = None
    result: Optional[str] = None
    validated: bool
    fee: Optional[str] = None
    
class HealthResponse(BaseModel):
    status: str
    testnet_connected: bool
    ledger: Optional[int] = None
    network: str
    
class ErrorResponse(BaseModel):
    detail: str
    error_type: Optional[str] = None

class CarCreateRequest(BaseModel):
    wallet_address: str = Field(..., description="Owner's wallet address")
    wallet_seed: str = Field(..., description="Owner's wallet seed for payment")
    
    @validator('wallet_address')
    def validate_wallet_address(cls, v):
        if not v.startswith('r'):
            raise ValueError('Invalid XRP address format')
        return v

class CarResponse(BaseModel):
    car_id: str
    wallet_address: str
    training_count: int
    created_at: str
    last_trained: Optional[str] = None
    
class GarageResponse(BaseModel):
    wallet_address: str
    cars: list[CarResponse]
    total_cars: int

class TrainCarRequest(BaseModel):
    car_id: str
    wallet_address: str
    wallet_seed: str = Field(..., description="Owner's wallet seed for payment")
    attribute_indices: Optional[list[int]] = None
    
class TrainCarResponse(BaseModel):
    success: bool
    car_id: str
    training_count: int
    message: str
    payment_required: bool = True
    trained_attributes: Optional[list[str]] = None
    speed: Optional[float] = None
    
class TestSpeedRequest(BaseModel):
    car_id: str
    wallet_address: str
    
class TestSpeedResponse(BaseModel):
    success: bool
    car_id: str
    improved: bool
    message: str
    speed: Optional[float] = None

class EnterRaceRequest(BaseModel):
    car_id: str
    wallet_address: str
    wallet_seed: str = Field(..., description="Owner's wallet seed for payment (1 XRP entry fee)")
    
class RaceResponse(BaseModel):
    success: bool
    race_id: str
    car_id: str
    your_rank: int
    winner_car_id: str
    total_participants: int
    prize_awarded: bool
    message: str

class SellCarRequest(BaseModel):
    car_id: str
    wallet_address: str
    
class SellCarResponse(BaseModel):
    success: bool
    message: str
    refund_amount: float
