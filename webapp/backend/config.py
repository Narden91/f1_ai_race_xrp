import os
from typing import List

class Settings:
    
    APP_NAME: str = "XRP Hackathon API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "True") == "True"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://frontend:5173",
    ]
    
    TESTNET_URL: str = os.getenv("TESTNET_URL", "https://s.altnet.rippletest.net:51234/")
    TESTNET_WSS: str = os.getenv("TESTNET_WSS", "wss://s.altnet.rippletest.net:51233")
    NETWORK: str = os.getenv("NETWORK", "testnet")
    
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

settings = Settings()
