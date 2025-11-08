import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import NetworkStatus from './NetworkStatus'
import { APP_CONFIG } from '../config'

const Header = ({ wallet, onLoginClick, onHomeClick }) => {
  const [scrolled, setScrolled] = useState(false)
  const isConnected = true

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xl'
          : 'bg-white/80 backdrop-blur-sm shadow-lg'
      } border-b border-gray-200`}
    >
      <div className="w-full">
        <div className="flex justify-between items-center h-24 px-8">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onHomeClick}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white text-2xl font-bold">🏎️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {APP_CONFIG.name}
                  </h1>
                </div>
              </div>
            </button>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            <NetworkStatus isConnected={isConnected} />

            {/* Wallet Info or Login Button */}
            {wallet ? (
              <div className="hidden lg:block px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                <span className="text-xs font-mono text-gray-700">
                  {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                </span>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-6 py-2 bg-gray-900 text-white rounded-full font-semibold text-sm hover:bg-gray-800 transition-all duration-300 shadow-sm"
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

Header.propTypes = {
  wallet: PropTypes.shape({
    address: PropTypes.string,
  }),
  onLoginClick: PropTypes.func,
  onHomeClick: PropTypes.func,
}

export default Header