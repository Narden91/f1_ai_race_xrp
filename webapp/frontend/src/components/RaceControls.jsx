import PropTypes from 'prop-types'
import ActionButton from './ActionButton'

const RaceControls = ({ onTrain, onTestSpeed, onRace, disabled, loading }) => {
  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 backdrop-blur rounded-2xl p-6 border-2 border-red-200 shadow-lg hover:shadow-xl transition-all">
      <h3 className="text-2xl font-bold mb-4 text-red-800 flex items-center gap-2">
        🎮 Controls
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <ActionButton onClick={onTrain} disabled={disabled || loading} loading={loading} variant="primary">
          <div className="text-center">
            <div className="text-2xl mb-1">🔁</div>
            <div className="font-semibold">Train Car</div>
            <div className="text-[10px] mt-1 opacity-80">1 XRP • Creates new car variant</div>
          </div>
        </ActionButton>
        
        <ActionButton onClick={onTestSpeed} disabled={disabled || loading} loading={loading} variant="test">
          <div className="text-center">
            <div className="text-2xl mb-1">🏁</div>
            <div className="font-semibold">Test Speed</div>
            <div className="text-[10px] mt-1 opacity-80">Check if speed improved</div>
          </div>
        </ActionButton>

        <ActionButton onClick={onRace} disabled={disabled || loading} loading={loading} variant="secondary">
          <div className="text-center">
            <div className="text-2xl mb-1">🚀</div>
            <div className="font-semibold">Join Race</div>
            <div className="text-[10px] mt-1 opacity-80">Costs 1 XRP • Winner gets 100 XRP</div>
          </div>
        </ActionButton>
      </div>
      <p className="mt-4 text-xs text-red-600">Transactions are signed locally and validated on-chain via backend.</p>
    </div>
  )
}

RaceControls.propTypes = {
  onTrain: PropTypes.func.isRequired,
  onTestSpeed: PropTypes.func.isRequired,
  onRace: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
}

export default RaceControls
