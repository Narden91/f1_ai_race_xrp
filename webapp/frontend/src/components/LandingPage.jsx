import PropTypes from 'prop-types'
import { useState } from 'react'
import WalletImportModal from './WalletImportModal'
import Spinner from './Spinner'

const LandingPage = ({ onCreateWallet, loading }) => {
  const [showImportModal, setShowImportModal] = useState(false)

  const handleImport = async (seed) => {
    await onCreateWallet(seed)
  }

  return (
    <div className="text-center animate-fadeIn">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-5xl mx-auto border-2 border-orange-100 hover:shadow-3xl transition-all duration-500">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="mb-6 animate-slideDown">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform duration-300">
              <span className="text-white text-6xl font-bold">🏎️</span>
            </div>
          </div>
          <h2 className="text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-4 animate-slideUp">
            Welcome to F1 AI Racing
          </h2>
          <p className="text-2xl text-gray-700 mb-4 animate-slideUp">
            Your Gateway to Digital Payments
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-slideUp">
            Experience the future of digital payments with XRP Ledger technology.
            Fast, secure, and ready for the next generation of financial applications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🚀</div>
            <h3 className="font-bold text-orange-800 mb-2 text-lg">Lightning Fast</h3>
            <p className="text-sm text-orange-600">3-5 second settlements</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border-2 border-red-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🔒</div>
            <h3 className="font-bold text-red-800 mb-2 text-lg">Secure</h3>
            <p className="text-sm text-red-600">Enterprise-grade security</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl border-2 border-yellow-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🌐</div>
            <h3 className="font-bold text-yellow-800 mb-2 text-lg">Global</h3>
            <p className="text-sm text-yellow-600">Worldwide accessibility</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border-2 border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">💎</div>
            <h3 className="font-bold text-amber-800 mb-2 text-lg">Low Cost</h3>
            <p className="text-sm text-amber-600">Minimal transaction fees</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => onCreateWallet()}
            disabled={loading}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl hover:shadow-3xl min-w-[250px]"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Spinner size="sm" color="white" />
                <span>Creating Wallet...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>🚀</span>
                <span>Create New Wallet</span>
              </span>
            )}
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            disabled={loading}
            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-105 border-2 border-gray-300 hover:border-orange-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg min-w-[250px]"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>📥</span>
              <span>Import Wallet</span>
            </span>
          </button>
        </div>

        {/* Info Badge */}
        <div className="mt-6 inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-orange-200 rounded-full">
          <span className="text-orange-700 font-semibold text-sm flex items-center space-x-2">
            <span>🧪</span>
            <span>Testnet Environment - Safe for Development</span>
          </span>
        </div>
      </div>

      {/* Import Wallet Modal */}
      <WalletImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        loading={loading}
      />
    </div>
  )
}

LandingPage.propTypes = {
  onCreateWallet: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
}

export default LandingPage