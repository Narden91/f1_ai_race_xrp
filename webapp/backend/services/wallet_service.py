import xrpl
from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet
from xrpl.utils import drops_to_xrp
from typing import Dict, Any
from config import settings

class WalletService:
    
    def __init__(self):
        self.testnet_url = settings.TESTNET_URL
    
    def create_wallet(self, seed: str = "") -> Dict[str, str]:
        client = JsonRpcClient(self.testnet_url)
        
        if seed == "":
            new_wallet = Wallet.generate()
            
            try:
                funded_wallet = xrpl.wallet.generate_faucet_wallet(client)
                new_wallet = funded_wallet
            except Exception as e:
                print(f"Faucet error: {e}")
        else:
            new_wallet = Wallet.from_seed(seed)
        
        return {
            "address": new_wallet.address,
            "seed": new_wallet.seed,
            "public_key": new_wallet.public_key
        }
    
    def get_balance(self, address: str) -> Dict[str, Any]:
        client = JsonRpcClient(self.testnet_url)
        
        acct_info = xrpl.models.requests.AccountInfo(
            account=address,
            ledger_index="validated"
        )
        
        response = client.request(acct_info)
        balance_drops = response.result['account_data']['Balance']
        balance_xrp = drops_to_xrp(balance_drops)
        
        return {
            "address": address,
            "balance_xrp": float(balance_xrp),
            "balance_drops": balance_drops
        }
    
    def get_account_info(self, address: str) -> Dict[str, Any]:
        client = JsonRpcClient(self.testnet_url)
        
        acct_info = xrpl.models.requests.AccountInfo(
            account=address,
            ledger_index="validated"
        )
        
        response = client.request(acct_info)
        return response.result.get('account_data', {})
