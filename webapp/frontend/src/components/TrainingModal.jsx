import PropTypes from 'prop-types'
import { useState } from 'react'

const ATTRIBUTES = [
  { id: 0, name: 'Tyres', icon: '🏎️', description: 'Tyre quality and grip' },
  { id: 1, name: 'Brakes', icon: '🛑', description: 'Braking performance' },
  { id: 2, name: 'Engine', icon: '⚙️', description: 'Engine power output' },
  { id: 3, name: 'Aerodynamics', icon: '💨', description: 'Air flow efficiency' },
  { id: 4, name: 'Suspension', icon: '🔧', description: 'Suspension quality' },
  { id: 5, name: 'Transmission', icon: '⚡', description: 'Gear shifting efficiency' },
  { id: 6, name: 'Fuel System', icon: '⛽', description: 'Fuel optimization' },
  { id: 7, name: 'Electronics', icon: '💻', description: 'Electronic systems' },
  { id: 8, name: 'Chassis', icon: '🏗️', description: 'Frame rigidity' },
  { id: 9, name: 'Cooling', icon: '❄️', description: 'Cooling efficiency' }
]

const TrainingModal = ({ isOpen, onClose, onTrain, loading }) => {
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [trainAll, setTrainAll] = useState(true)

  if (!isOpen) return null

  const handleToggleAttribute = (id) => {
    setTrainAll(false)
    if (selectedAttributes.includes(id)) {
      setSelectedAttributes(selectedAttributes.filter(attrId => attrId !== id))
    } else {
      setSelectedAttributes([...selectedAttributes, id])
    }
  }

  const handleTrainAll = () => {
    setTrainAll(true)
    setSelectedAttributes([])
  }

  const handleTrain = () => {
    if (trainAll) {
      onTrain(null) // null means train all
    } else if (selectedAttributes.length > 0) {
      onTrain(selectedAttributes)
    }
  }

  const canTrain = trainAll || selectedAttributes.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              🔧 Train Your Car
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Info */}
          <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl">
            <p className="text-sm text-yellow-800">
              💡 <strong>Training Cost:</strong> 1 XRP per session<br/>
              Training will <strong>create a NEW car</strong> based on the selected one with modified attributes (±20 points per attribute, range: 1-999)
            </p>
          </div>

          {/* Train All Option */}
          <div className="mb-6">
            <button
              onClick={handleTrainAll}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                trainAll
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-600 text-white shadow-lg'
                  : 'bg-white border-orange-200 text-gray-800 hover:border-orange-400'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🎯</span>
                <div className="text-left">
                  <div className="font-bold text-lg">Train All Attributes</div>
                  <div className={`text-sm ${trainAll ? 'text-orange-100' : 'text-gray-600'}`}>
                    Creates new car with all 10 attributes improved
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Or Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t-2 border-orange-300"></div>
            <span className="text-gray-500 font-semibold">OR</span>
            <div className="flex-1 border-t-2 border-orange-300"></div>
          </div>

          {/* Individual Attributes */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Select Specific Attributes:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ATTRIBUTES.map((attr) => (
                <button
                  key={attr.id}
                  onClick={() => handleToggleAttribute(attr.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedAttributes.includes(attr.id) && !trainAll
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 border-orange-600 text-white shadow-lg transform scale-105'
                      : 'bg-white border-orange-200 text-gray-800 hover:border-orange-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{attr.icon}</span>
                    <div className="font-semibold">{attr.name}</div>
                  </div>
                  <div className={`text-xs ${
                    selectedAttributes.includes(attr.id) && !trainAll
                      ? 'text-orange-100'
                      : 'text-gray-600'
                  }`}>
                    {attr.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {!trainAll && selectedAttributes.length > 0 && (
            <div className="mb-6 p-4 bg-orange-100 border-2 border-orange-300 rounded-xl">
              <p className="text-sm text-orange-800">
                <strong>Selected:</strong> {selectedAttributes.length} attribute{selectedAttributes.length !== 1 ? 's' : ''}
                {' - '}
                {selectedAttributes.map(id => ATTRIBUTES[id].name).join(', ')}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleTrain}
              disabled={!canTrain || loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating New Car...
                </div>
              ) : (
                <>🚀 Create New Car (1 XRP)</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

TrainingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTrain: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

export default TrainingModal
