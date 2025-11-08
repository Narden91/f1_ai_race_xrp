import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const typeStyles = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-300',
    error: 'bg-gradient-to-r from-red-500 to-rose-500 border-red-300',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-300',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-300',
  }

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`${typeStyles[type]} text-white px-6 py-4 rounded-xl shadow-2xl border-2 min-w-[300px] max-w-md backdrop-blur-sm`}
      >
        <div className="flex items-center space-x-3">
          <div className="text-2xl font-bold bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">
            {icons[type]}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsExiting(true)
              setTimeout(() => {
                setIsVisible(false)
                onClose?.()
              }, 300)
            }}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
}

export default Toast
