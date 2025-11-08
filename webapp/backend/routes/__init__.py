"""API routes package"""
from .wallet import router as wallet_router
from .payment import router as payment_router
from .health import router as health_router

__all__ = ['wallet_router', 'payment_router', 'health_router']
