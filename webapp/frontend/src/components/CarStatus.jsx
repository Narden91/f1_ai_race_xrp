import PropTypes from 'prop-types'

const CarStatus = ({ trainingCount, raceStatus, carId, lastSpeedTest }) => {
  const getSpeedTestDisplay = () => {
    if (!lastSpeedTest) {
      return <span className="text-gray-500">Not tested yet</span>
    }
    
    if (lastSpeedTest.speed !== undefined) {
      return (
        <div>
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {lastSpeedTest.speed.toFixed(2)} km/h
          </div>
          {lastSpeedTest.improved ? (
            <span className="text-green-600 font-semibold flex items-center gap-1 text-xs">
              🚀 Speed improved!
            </span>
          ) : lastSpeedTest.message?.includes('decreased') ? (
            <span className="text-red-600 font-semibold flex items-center gap-1 text-xs">
              ⚠️ Speed decreased
            </span>
          ) : lastSpeedTest.message?.includes('unchanged') ? (
            <span className="text-blue-600 font-semibold flex items-center gap-1 text-xs">
              ➡️ Speed unchanged
            </span>
          ) : (
            <span className="text-gray-600 font-semibold flex items-center gap-1 text-xs">
              📊 Baseline recorded
            </span>
          )}
        </div>
      )
    }
    
    return lastSpeedTest.improved ? (
      <span className="text-green-600 font-semibold flex items-center gap-1">
        Tested ✅ <span className="text-xs">(Speed improved!)</span>
      </span>
    ) : (
      <span className="text-amber-600 font-semibold flex items-center gap-1">
        Tested ✅ <span className="text-xs">(No change)</span>
      </span>
    )
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 backdrop-blur rounded-2xl p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all">
      <h3 className="text-2xl font-bold mb-4 text-orange-800 flex items-center gap-2">
        🏎️ Car Card
      </h3>
      <div className="space-y-3">
        <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
          <span className="text-xs font-semibold text-orange-700 uppercase">Car ID</span>
          <p className="font-mono text-sm text-gray-800 mt-1">{carId || 'CAR-abc123'}</p>
        </div>
        
        <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
          <span className="text-xs font-semibold text-orange-700 uppercase">Training Level</span>
          <p className="text-sm text-gray-800 mt-1">Trained {trainingCount} {trainingCount === 1 ? 'time' : 'times'}</p>
        </div>

        <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
          <span className="text-xs font-semibold text-orange-700 uppercase">Current Speed</span>
          <div className="mt-1">{getSpeedTestDisplay()}</div>
        </div>

        <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
          <span className="text-xs font-semibold text-orange-700 uppercase">Status</span>
          <p className="text-sm text-gray-800 mt-1 capitalize">{raceStatus}</p>
        </div>
      </div>
      <p className="mt-4 text-xs text-orange-600 italic">
        Speed formula is secretly maintained server-side for fairness.
      </p>
    </div>
  )
}

CarStatus.propTypes = {
  trainingCount: PropTypes.number.isRequired,
  raceStatus: PropTypes.string.isRequired,
  carId: PropTypes.string,
  lastSpeedTest: PropTypes.shape({
    improved: PropTypes.bool,
    speed: PropTypes.number,
    message: PropTypes.string,
  }),
}

export default CarStatus
