import PropTypes from 'prop-types'
import { formatAddress } from '../utils'

const TransactionHistory = ({ transactions }) => {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-orange-100">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">Transaction History</h2>
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400">Your transaction history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="border border-orange-200 rounded-lg p-4 hover:bg-orange-50/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.status === 'tesSUCCESS' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.status === 'tesSUCCESS' ? '✅' : '❌'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Sent {tx.amount} XRP
                    </p>
                    <p className="text-sm text-gray-600 font-mono">
                      To: {formatAddress(tx.destination)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{tx.timestamp}</p>
                  <p className={`text-sm font-medium ${
                    tx.status === 'tesSUCCESS' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.status === 'tesSUCCESS' ? 'Success' : 'Failed'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

TransactionHistory.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      amount: PropTypes.string.isRequired,
      destination: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired
    })
  ).isRequired
}

export default TransactionHistory