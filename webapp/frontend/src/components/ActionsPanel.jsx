import PropTypes from 'prop-types'
import { useState } from 'react'
import ActionButton from './ActionButton'
import PaymentModal from './PaymentModal'

const ActionsPanel = ({ onSendPayment, onResetWallet, loading, txResult }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleCustomPayment = async (destination, amount) => {
    await onSendPayment(destination, amount)
  }

  const handleQuickPayment = async () => {
    await onSendPayment('rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY', 10)
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-orange-100 hover:shadow-2xl transition-all duration-300">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
        <span>⚡</span>
        <span>Quick Actions</span>
      </h2>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <ActionButton
          onClick={() => setShowPaymentModal(true)}
          disabled={loading}
          variant="primary"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">💸</div>
            <div className="font-semibold">Send Payment</div>
            <div className="text-xs opacity-80">Custom amount</div>
          </div>
        </ActionButton>

        <ActionButton
          onClick={handleQuickPayment}
          disabled={loading}
          loading={loading}
          variant="primary"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-semibold">Quick Send</div>
            <div className="text-xs opacity-80">10 XRP to faucet</div>
          </div>
        </ActionButton>

        <ActionButton
          onClick={onResetWallet}
          variant="secondary"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🔄</div>
            <div className="font-semibold">New Wallet</div>
            <div className="text-xs opacity-80">Start fresh</div>
          </div>
        </ActionButton>
      </div>

      {txResult && (
        <div className={`p-5 rounded-2xl border-2 animate-slideDown ${
          txResult === 'tesSUCCESS'
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              txResult === 'tesSUCCESS' ? 'bg-green-200' : 'bg-red-200'
            }`}>
              <span className={`text-2xl ${txResult === 'tesSUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                {txResult === 'tesSUCCESS' ? '✓' : '✕'}
              </span>
            </div>
            <div className="flex-1">
              <p className={`font-bold text-lg ${
                txResult === 'tesSUCCESS' ? 'text-green-800' : 'text-red-800'
              }`}>
                Transaction {txResult === 'tesSUCCESS' ? 'Successful!' : 'Failed'}
              </p>
              <p className="text-sm text-gray-600 font-mono mt-1">
                Status: {txResult}
              </p>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSendPayment={handleCustomPayment}
        loading={loading}
      />
    </div>
  )
}

ActionsPanel.propTypes = {
  onSendPayment: PropTypes.func.isRequired,
  onResetWallet: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  txResult: PropTypes.string
}

export default ActionsPanel