import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

const NetworkStatus = ({ isConnected = true }) => {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    setStatus(isConnected ? 'connected' : 'disconnected')
  }, [isConnected])

  const statusConfig = {
    connected: {
      color: 'bg-green-500',
      text: 'Connected',
      icon: '●',
    },
    disconnected: {
      color: 'bg-red-500',
      text: 'Disconnected',
      icon: '●',
    },
    checking: {
      color: 'bg-yellow-500',
      text: 'Checking...',
      icon: '●',
    },
  }

  const config = statusConfig[status]

  return (
    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
      <span className={`${config.color} w-2 h-2 rounded-full animate-pulse`}></span>
      <span className="text-xs font-medium text-gray-700">{config.text}</span>
    </div>
  )
}

NetworkStatus.propTypes = {
  isConnected: PropTypes.bool,
}

export default NetworkStatus
