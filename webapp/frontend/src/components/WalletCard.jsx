import PropTypes from 'prop-types'
import { formatAddress, formatBalance } from '../utils'
import CopyButton from './CopyButton'

const WalletCard = ({ wallet, balance, onRefresh, connectionType }) => {
  const isGemWallet = connectionType === 'gemwallet' || (wallet && !wallet.seed)
  
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-100 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center space-x-3">
          <span>💼</span>
          <span>Wallet Dashboard</span>
        </h2>
        <button
          onClick={() => {
            // HACKATHON DEMO: Warn user that refresh will reset balance
            if (!confirm('⚠️ DEMO MODE: Refreshing will reset your balance to blockchain value (10 XRP). This is because payments are mocked for demo. Continue?')) {
              return
            }
            onRefresh()
          }}
          className="bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 text-orange-700 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-800 flex items-center space-x-2">
              <span>🏦</span>
              <span>Wallet Address</span>
            </h3>
            {wallet?.address && <CopyButton text={wallet.address} label="Copy" />}
          </div>
          <div className="bg-white/80 p-4 rounded-lg border border-orange-200 shadow-sm group-hover:shadow-md transition-shadow">
            <p className="text-sm font-mono text-gray-800 break-all">
              {wallet?.address || 'No wallet created'}
            </p>
          </div>
          {wallet?.address && (
            <p className="text-xs text-orange-600 mt-3 flex items-center space-x-2">
              <span>✓</span>
              <span>{formatAddress(wallet.address, 20)}</span>
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 p-6 rounded-2xl border-2 border-red-200 hover:border-red-300 transition-all duration-300">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center space-x-2">
            <span>💰</span>
            <span>XRP Balance</span>
          </h3>
          <div className="space-y-2">
            <div className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              {formatBalance(balance)}
            </div>
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-xl font-semibold">XRP</span>
              <span className="inline-flex items-center px-2 py-1 bg-red-200/50 rounded-full text-xs font-medium">
                TestNet
              </span>
            </div>
          </div>
        </div>
      </div>

      {wallet?.seed && !isGemWallet && (
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border-2 border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 mb-1">Seed Security Notice</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Your seed is the key to your wallet. Keep it secure and never share it!
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-white/60 p-2 rounded-lg border border-yellow-300">
                  <p className="text-xs font-mono text-gray-700 truncate">{wallet.seed}</p>
                </div>
                <CopyButton text={wallet.seed} label="Copy Seed" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isGemWallet && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 border-purple-200">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💎</div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-800 mb-1">GemWallet Connected</h4>
              <p className="text-sm text-purple-700">
                Your wallet is secured by GemWallet. All transactions require approval through the extension.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

WalletCard.propTypes = {
  wallet: PropTypes.shape({
    address: PropTypes.string,
    seed: PropTypes.string
  }),
  balance: PropTypes.string,
  onRefresh: PropTypes.func.isRequired,
  connectionType: PropTypes.string
}

export default WalletCard