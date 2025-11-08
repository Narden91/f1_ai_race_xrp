import PropTypes from 'prop-types'
import { useState } from 'react'
import Modal from './Modal'
import Spinner from './Spinner'

const PaymentModal = ({ isOpen, onClose, onSendPayment, loading }) => {
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!destination || !amount) {
      setError('Please fill in all fields')
      return
    }

    if (!destination.startsWith('r')) {
      setError('Invalid XRP address format')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number')
      return
    }

    try {
      await onSendPayment(destination, amountNum)
      setDestination('')
      setAmount('')
      onClose()
    } catch (err) {
      setError(err.message || 'Payment failed')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send XRP Payment" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Destination Address
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="rPEPPER7kfTD9w2To4CQk6UCfuHM9c6GDY"
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors font-mono text-sm"
            disabled={loading}
          />
          <p className="mt-2 text-xs text-gray-500">
            Enter a valid XRP Ledger address starting with 'r'
          </p>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Amount (XRP)
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10.0"
              step="0.000001"
              min="0"
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors"
              disabled={loading}
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
              XRP
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">Minimum: 0.000001 XRP</p>
            <div className="flex space-x-2">
              {[1, 5, 10, 50].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 text-orange-700 rounded-lg text-xs font-medium transition-all"
                  disabled={loading}
                >
                  {val} XRP
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <span className="text-xl">❌</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <Spinner size="sm" color="white" />
                <span>Sending...</span>
              </span>
            ) : (
              'Send Payment'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

PaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSendPayment: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default PaymentModal
