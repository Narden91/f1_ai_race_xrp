import { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useGemWallet } from '../hooks'

const LoginPage = ({ onLogin, onBack }) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { isInstalled, connect, checkInstallation, isChecking } = useGemWallet()

  // Debug function to check GemWallet
  const checkGemWalletDebug = async () => {
    console.log('=== GemWallet Debug Info (@gemwallet/api) ===')
    console.log('isInstalled state:', isInstalled)
    console.log('isChecking state:', isChecking)
    
    // Force recheck
    const recheckResult = await checkInstallation()
    console.log('Recheck result:', recheckResult)
    
    // Also check window.gemWallet for backwards compatibility
    console.log('window.gemWallet exists:', typeof window.gemWallet !== 'undefined')
    console.log('window.gemWallet type:', typeof window.gemWallet)
    
    // Check if running in correct context
    console.log('Page URL:', window.location.href)
    console.log('Is HTTPS or localhost:', window.location.protocol === 'https:' || window.location.hostname === 'localhost')
    console.log('Document readyState:', document.readyState)
    
    let message = `GemWallet SDK Detection:\n\n`
    message += `isInstalled: ${isInstalled}\n`
    message += `Recheck result: ${recheckResult}\n`
    message += `isChecking: ${isChecking}\n\n`
    message += 'Check console (F12) for full details.'
    
    alert(message)
  }

  const handleGemWalletConnect = useCallback(async () => {
    setError('')
    setIsLoading(true)

    try {
      // 1. Check installation
      if (!isInstalled) {
        setError('GemWallet is not installed. Please install it from gemwallet.app')
        setIsLoading(false)
        return
      }

      // 2. Connect to GemWallet
      const result = await connect()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to connect to GemWallet')
      }

      // 3. Validate network (already done in connect, but double-check)
      if (result.network && result.network.toLowerCase() !== 'testnet') {
        throw new Error(`Please switch to Testnet in your GemWallet settings. Currently connected to: ${result.network}`)
      }

      // 4. Pass data to parent (App.jsx)
      await onLogin({ 
        type: 'gem', 
        address: result.address,
        balance: result.balance,
        publicKey: result.publicKey,
        network: result.network
      })
    } catch (err) {
      setError(err.message || 'Failed to connect to GemWallet')
    } finally {
      setIsLoading(false)
    }
  }, [isInstalled, connect, onLogin])

  const handleManualLogin = useCallback(async (e) => {
    e.preventDefault()
    setError('')

    // Quick validation
    if (!walletAddress.trim()) {
      setError('Please enter your wallet address')
      return
    }

    if (!walletAddress.startsWith('r')) {
      setError('Invalid XRP address format')
      return
    }

    setIsLoading(true)
    
    try {
      await onLogin({ type: 'manual', address: walletAddress.trim() })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress, onLogin])

  const handleCreateWallet = useCallback(async () => {
    setIsLoading(true)
    try {
      await onLogin({ type: 'create' })
    } catch (err) {
      setError(err.message || 'Failed to create wallet')
    } finally {
      setIsLoading(false)
    }
  }, [onLogin])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md px-8">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-8 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        )}

        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏎️</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            F1 AI Racing
          </h1>
          <p className="text-gray-600">
            Connect your XRP wallet to start racing
          </p>
        </div>

        {/* Gem Wallet Connect Button */}
        <div className="mb-6">
          <button
            onClick={handleGemWalletConnect}
            disabled={isLoading || !isInstalled || isChecking}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
          >
            <span className="text-2xl">💎</span>
            <span>
              {isLoading ? 'Connecting...' : isChecking ? 'Checking...' : (isInstalled ? 'Login with Gem Wallet' : 'Gem Wallet Not Detected')}
            </span>
          </button>
          {!isInstalled && !isChecking && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800 font-semibold mb-2">
                ⚠️ GemWallet extension is not accessible on this page
              </p>
              <p className="text-xs text-yellow-700 mb-2">
                Please configure GemWallet permissions:
              </p>
              <ol className="text-xs text-yellow-700 space-y-1 ml-4 list-decimal">
                <li>Go to <code className="bg-yellow-100 px-1 rounded">chrome://extensions/</code></li>
                <li>Find <strong>GemWallet</strong> → Click <strong>Details</strong></li>
                <li>Under "Site access" → Select <strong>"On all sites"</strong></li>
                <li>Click the button below to refresh detection</li>
              </ol>
              <div className="mt-3 flex gap-2">
                <a 
                  href="https://gemwallet.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-blue-600 hover:underline font-semibold"
                >
                  Install GemWallet →
                </a>
                <button
                  onClick={checkInstallation}
                  className="ml-auto px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded text-xs font-semibold transition-colors"
                >
                  🔄 Refresh Detection
                </button>
              </div>
            </div>
          )}
          {isInstalled && !isLoading && (
            <p className="mt-2 text-xs text-center text-green-600 flex items-center justify-center gap-1">
              <span>✓</span>
              <span>Gem Wallet detected and ready</span>
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or enter manually</span>
          </div>
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleManualLogin} className="space-y-6">
          {/* Wallet Address Input */}
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-semibold text-gray-900 mb-2">
              Wallet Address
            </label>
            <input
              id="walletAddress"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="rXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 transition-colors font-mono text-sm"
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-4 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Continue'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Create New Wallet */}
        <button
          type="button"
          onClick={handleCreateWallet}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-full font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300"
        >
          Create New Wallet
        </button>

        {/* Footer Note */}
        <p className="mt-8 text-center text-sm text-gray-500">
          🏁 Testnet racing environment • Train for 1 XRP • Win 100 XRP per race
        </p>
        
        {/* Debug Button */}
        <button
          onClick={checkGemWalletDebug}
          className="mt-4 w-full px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          🔧 Debug GemWallet Detection
        </button>
      </div>
    </div>
  )
}

LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onBack: PropTypes.func,
}

export default LoginPage
