from fastapi import APIRouter, HTTPException, status
from models import PaymentRequest, PaymentResponse, ErrorResponse
from services import PaymentService
import xrpl.transaction

router = APIRouter(prefix="/payment", tags=["Payment"])
payment_service = PaymentService()

@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def send_payment(payment: PaymentRequest):
    try:
        result = payment_service.send_payment(
            sender_seed=payment.sender_seed,
            destination=payment.destination,
            amount=payment.amount
        )
        return result
    except xrpl.transaction.XRPLReliableSubmissionException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Transaction failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment processing error: {str(e)}"
        )

@router.get(
    "/{address}/history",
    responses={500: {"model": ErrorResponse}}
)
async def get_transaction_history(address: str, limit: int = 10):
    try:
        if limit > 50:
            limit = 50
        result = payment_service.get_transaction_history(address, limit)
        return {"transactions": result}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transaction history: {str(e)}"
        )
