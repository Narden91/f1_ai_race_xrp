from fastapi import APIRouter, HTTPException, status
from models import WalletCreateRequest, WalletResponse, BalanceResponse, ErrorResponse
from services import WalletService

router = APIRouter(prefix="/wallet", tags=["Wallet"])
wallet_service = WalletService()

@router.post(
    "/create", 
    response_model=WalletResponse,
    status_code=status.HTTP_201_CREATED,
    responses={500: {"model": ErrorResponse}}
)
async def create_wallet(wallet_data: WalletCreateRequest):
    try:
        result = wallet_service.create_wallet(wallet_data.seed)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create wallet: {str(e)}"
        )

@router.get(
    "/{address}/balance",
    response_model=BalanceResponse,
    responses={500: {"model": ErrorResponse}}
)
async def get_balance(address: str):
    try:
        result = wallet_service.get_balance(address)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get balance: {str(e)}"
        )

@router.get(
    "/{address}/info",
    responses={500: {"model": ErrorResponse}}
)
async def get_account_info(address: str):
    try:
        result = wallet_service.get_account_info(address)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get account info: {str(e)}"
        )
