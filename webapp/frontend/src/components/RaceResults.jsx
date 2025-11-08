import PropTypes from 'prop-types'

const RaceResults = ({ race, playerAddress, raceStatus, waitingPlayers }) => {
  if (raceStatus === 'queued' || raceStatus === 'waiting') {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-300 shadow-lg">
        <h3 className="text-2xl font-bold mb-3 text-yellow-800">⏳ Race Lobby</h3>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🏁</div>
          <p className="text-lg font-semibold text-yellow-800">
            Waiting for players... ({waitingPlayers?.current || 1}/{waitingPlayers?.max || 8})
          </p>
          <p className="text-sm text-yellow-600 mt-2">Race will start when enough players join</p>
        </div>
      </div>
    )
  }

  if (!race) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-300 shadow-lg">
        <h3 className="text-2xl font-bold mb-3 text-gray-700">🏆 Race Results</h3>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🏎️</div>
          <p className="text-gray-500">No race results yet</p>
          <p className="text-sm text-gray-400 mt-2">Join a race to see your results here</p>
        </div>
      </div>
    )
  }

  const youWon = race?.winner === playerAddress
  const yourRank = race?.yourRank ?? '?'
  const winnerCarId = race?.winnerCarId || `CAR-${race?.winner?.slice(0, 6)}`

  return (
    <div className={`rounded-2xl p-6 border-2 shadow-lg ${
      youWon 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
        : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
    }`}>
      <h3 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        🏆 Race Results
      </h3>
      
      <div className="space-y-3">
        {youWon ? (
          <div className="bg-green-100/60 rounded-lg p-4 border-2 border-green-400">
            <p className="text-2xl font-bold text-green-800 text-center">🎉 You Won!</p>
            <p className="text-center text-green-700 text-lg mt-1">You placed #{yourRank}</p>
          </div>
        ) : (
          <div className="bg-white/60 rounded-lg p-4 border border-orange-200">
            <p className="text-lg font-bold text-orange-800 text-center">You placed #{yourRank}</p>
          </div>
        )}

        <div className="bg-white/60 rounded-lg p-3 border border-orange-200">
          <span className="text-xs font-semibold text-orange-700 uppercase">Winner</span>
          <p className="text-sm text-gray-800 mt-1 font-mono">{winnerCarId}</p>
        </div>

        {race?.prizeAwarded && (
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg p-3 border-2 border-yellow-400">
            <p className="text-emerald-700 font-bold text-center">+100 XRP awarded 💰</p>
          </div>
        )}
      </div>
      
      <p className="mt-4 text-xs text-orange-600 italic">
        Other cars' details and actual speed values remain hidden. Only final placement shown.
      </p>
    </div>
  )
}

RaceResults.propTypes = {
  race: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    participants: PropTypes.number,
    winner: PropTypes.string,
    winnerCarId: PropTypes.string,
    yourRank: PropTypes.number,
    prizeAwarded: PropTypes.bool,
  }),
  playerAddress: PropTypes.string,
  raceStatus: PropTypes.string,
  waitingPlayers: PropTypes.shape({
    current: PropTypes.number,
    max: PropTypes.number,
  }),
}

export default RaceResults
