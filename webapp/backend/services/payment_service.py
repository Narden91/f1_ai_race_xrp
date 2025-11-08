import xrpl
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import Payment
from xrpl.transaction import submit_and_wait
from xrpl.utils import xrp_to_drops
from typing import Dict, Any
from config import settings

class PaymentService:
    
    def __init__(self):
        self.testnet_url = settings.TESTNET_URL
    
    def send_payment(
        self, 
        sender_seed: str, 
        destination: str, 
        amount: float,
        memo: str = None
    ) -> Dict[str, Any]:
        client = JsonRpcClient(self.testnet_url)
        sender_wallet = Wallet.from_seed(sender_seed)
        
        payment_tx = Payment(
            account=sender_wallet.address,
            amount=xrp_to_drops(amount),
            destination=destination,
        )
        
        if memo:
            payment_tx.memos = [
                xrpl.models.transactions.Memo(
                    memo_data=memo.encode('utf-8').hex()
                )
            ]
        
        response = submit_and_wait(payment_tx, client, sender_wallet)
        
        result_data = {
            "status": "success",
            "transaction_hash": response.result.get('hash'),
            "result": response.result.get('meta', {}).get('TransactionResult'),
            "validated": response.result.get('validated', False),
        }
        
        if 'Fee' in response.result:
            result_data['fee'] = response.result['Fee']
        
        return result_data
    
    def get_transaction_history(self, address: str, limit: int = 10) -> list:
        client = JsonRpcClient(self.testnet_url)
        
        tx_request = xrpl.models.requests.AccountTx(
            account=address,
            ledger_index_min=-1,
            ledger_index_max=-1,
            limit=limit
        )
        
        response = client.request(tx_request)
        return response.result.get('transactions', [])
