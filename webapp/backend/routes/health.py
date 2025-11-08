from fastapi import APIRouter, status
from models import HealthResponse
import xrpl
from xrpl.clients import JsonRpcClient
from config import settings

router = APIRouter(tags=["Health"])

@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK
)
async def health_check():
    try:
        client = JsonRpcClient(settings.TESTNET_URL)
        server_info = client.request(xrpl.models.requests.ServerInfo())
        
        return {
            "status": "healthy",
            "testnet_connected": True,
            "ledger": server_info.result.get('info', {}).get('validated_ledger', {}).get('seq'),
            "network": settings.NETWORK
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "testnet_connected": False,
            "network": settings.NETWORK,
            "error": str(e)
        }

@router.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "network": settings.NETWORK,
        "endpoints": {
            "GET /": "API info",
            "GET /health": "Health check",
            "POST /wallet/create": "Create new wallet",
            "GET /wallet/{address}/balance": "Get wallet balance",
            "GET /wallet/{address}/info": "Get account info",
            "POST /payment": "Send XRP payment",
            "GET /payment/{address}/history": "Get transaction history",
            "GET /docs": "API documentation"
        }
    }
