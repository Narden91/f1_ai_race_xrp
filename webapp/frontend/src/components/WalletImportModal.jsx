import PropTypes from 'prop-types'
import { useState } from 'react'
import Modal from './Modal'
import Spinner from './Spinner'

const WalletImportModal = ({ isOpen, onClose, onImport, loading }) => {
  const [seed, setSeed] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!seed || seed.trim().length < 10) {
      setError('Please enter a valid seed (at least 10 characters)')
      return
    }

    try {
      await onImport(seed.trim())
      setSeed('')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to import wallet')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Wallet" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Security Warning</h4>
              <p className="text-sm text-yellow-700">
                Only import seeds you trust. Never share your seed with anyone.
                This is a testnet environment - do not use real funds!
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Wallet Seed
          </label>
          <textarea
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Enter your XRP wallet seed here..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:border-red-400 transition-colors font-mono text-sm resize-none"
            disabled={loading}
          />
          <p className="mt-2 text-xs text-gray-500">
            Paste your wallet seed to import an existing wallet
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <span className="text-xl">❌</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

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
                <span>Importing...</span>
              </span>
            ) : (
              'Import Wallet'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

WalletImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default WalletImportModal
