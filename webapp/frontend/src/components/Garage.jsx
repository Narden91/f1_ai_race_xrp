import PropTypes from 'prop-types'
import { useState, useEffect, useCallback } from 'react'
import api from '../config/api'

const Garage = ({ walletAddress, balance, wallet, onCarCreated, onBalanceChange, onCarSelected }) => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedCar, setSelectedCar] = useState(null)
  const [hasCreatedCar, setHasCreatedCar] = useState(false)
  const [carSpeeds, setCarSpeeds] = useState({}) // Store tested speeds for each car
  const [testingSpeed, setTestingSpeed] = useState({}) // Loading state for speed tests
  const [sellingCar, setSellingCar] = useState({}) // Loading state for selling cars

  // Define selectCar BEFORE useEffect so it can be used
  const selectCar = useCallback((carId) => {
    setSelectedCar(carId)
    if (onCarSelected) {
      // Find the car data to pass along
      const carData = cars.find(c => c.car_id === carId)
      const speed = carSpeeds[carId]?.speed
      onCarSelected(carId, { ...carData, speed })
    }
  }, [onCarSelected, cars, carSpeeds])

  useEffect(() => {
    const loadGarage = async () => {
      if (!walletAddress) return
      
      try {
        const data = await api.getGarage(walletAddress)
        setCars(data.cars || [])
        
        // Check if user has created a car
        if (data.cars?.length > 0) {
          setHasCreatedCar(true)
        }
        
        // Auto-select first car if none selected
        if (data.cars?.length > 0 && !selectedCar) {
          selectCar(data.cars[0].car_id)
        }
      } catch (err) {
        console.error('Error loading garage:', err)
        setError('Failed to load garage')
      }
    }

    loadGarage()
  }, [walletAddress, selectedCar, selectCar])

  const loadGarage = async () => {
    if (!walletAddress) return
    
    try {
      const data = await api.getGarage(walletAddress)
      setCars(data.cars || [])
    } catch (err) {
      console.error('Error loading garage:', err)
      setError('Failed to load garage')
    }
  }

  const testCarSpeed = async (carId) => {
    setTestingSpeed(prev => ({ ...prev, [carId]: true }))
    try {
      const result = await api.testSpeed(carId, walletAddress)
      if (result.success && result.speed) {
        setCarSpeeds(prev => ({
          ...prev,
          [carId]: {
            speed: result.speed,
            message: result.message,
            improved: result.improved
          }
        }))
      }
    } catch (err) {
      console.error('Error testing speed:', err)
    } finally {
      setTestingSpeed(prev => ({ ...prev, [carId]: false }))
    }
  }

  const sellCar = async (carId) => {
    // Confirm before selling
    if (!window.confirm(`Are you sure you want to sell this car for 0.5 XRP? This cannot be undone.`)) {
      return
    }

    setSellingCar(prev => ({ ...prev, [carId]: true }))
    try {
      const result = await api.sellCar(carId, walletAddress)
      
      if (result.success) {
        // Update balance: add 0.5 XRP refund
        if (onBalanceChange) {
          const newBalance = (parseFloat(balance) + result.refund_amount).toFixed(2)
          onBalanceChange(newBalance)
        }
        
        // Remove car from local state
        setCars(prevCars => {
          const remainingCars = prevCars.filter(c => c.car_id !== carId)
          
          // Clear selection if this was the selected car
          if (selectedCar === carId) {
            // Auto-select another car if available
            if (remainingCars.length > 0) {
              selectCar(remainingCars[0].car_id)
            } else {
              selectCar(null)
            }
          }
          
          return remainingCars
        })
        
        // Remove speed data
        setCarSpeeds(prev => {
          const newSpeeds = { ...prev }
          delete newSpeeds[carId]
          return newSpeeds
        })
        
        alert(`✅ ${result.message}`)
      }
    } catch (err) {
      console.error('Error selling car:', err)
      setError(`Failed to sell car: ${err.message}`)
    } finally {
      setSellingCar(prev => ({ ...prev, [carId]: false }))
    }
  }

  const handleCreateCar = async () => {
    if (!walletAddress) {
      setError('No wallet connected')
      return
    }

    if (!wallet.seed) {
      setError('Wallet seed not available for payment authorization')
      return
    }

    // Check balance
    const balanceNum = parseFloat(balance || '0')
    if (balanceNum < 1) {
      setError('Insufficient balance. You need at least 1 XRP to create a car.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call backend to create car - backend will process 1 XRP payment via blockchain
      const result = await api.createCar(walletAddress, wallet.seed)
      
      if (result.car_id) {
        await loadGarage()
        selectCar(result.car_id)
        setHasCreatedCar(true)
        
        // HACKATHON DEMO: Manually update balance since payments are mocked
        if (onBalanceChange) {
          const newBalance = (parseFloat(balance) - 1).toFixed(2)
          onBalanceChange(newBalance)
        }
        
        // Notify parent that car was created (parent will refresh balance from blockchain)
        if (onCarCreated) {
          onCarCreated(result)
        }
      }
    } catch (err) {
      console.error('Error creating car:', err)
      setError(err.message || 'Failed to create car')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 backdrop-blur rounded-3xl p-8 border-2 border-orange-200 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-3">
          🏎️ My Garage
        </h2>
        <button
          onClick={handleCreateCar}
          disabled={loading || parseFloat(balance || '0') < 1 || hasCreatedCar}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </div>
          ) : hasCreatedCar ? (
            <>✓ Car Created</>
          ) : (
            <>➕ Create New Car (1 XRP)</>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border-2 border-red-300 rounded-xl text-red-800">
          ⚠️ {error}
        </div>
      )}

      {cars.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏎️</div>
          <p className="text-xl text-gray-600 mb-2">Your garage is empty</p>
          <p className="text-sm text-gray-500 mb-6">
            Create your first car to start racing! Each car has 10 hidden performance flags.
          </p>
          <p className="text-xs text-orange-600 italic">
            Cost: 1 XRP • You can create ONE initial car, then train it to generate variants
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <div
              key={car.car_id}
              onClick={() => selectCar(car.car_id)}
              className={`cursor-pointer transition-all duration-300 rounded-xl p-6 border-2 ${
                selectedCar === car.car_id
                  ? 'bg-gradient-to-br from-orange-100 to-red-100 border-orange-500 shadow-lg scale-105'
                  : 'bg-white/60 border-orange-200 hover:border-orange-400 hover:shadow-md'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">🏎️</div>
                <h3 className="font-bold text-lg text-gray-800 mb-2 font-mono">
                  {car.car_id}
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-semibold">Training:</span> {car.training_count}x
                  </p>
                  
                  {/* Display speed if tested */}
                  {carSpeeds[car.car_id] && (
                    <div className={`my-2 p-2 rounded-lg border ${
                      carSpeeds[car.car_id].speed >= 280
                        ? 'bg-green-50 border-green-300'
                        : carSpeeds[car.car_id].speed >= 220
                        ? 'bg-orange-50 border-orange-300'
                        : 'bg-red-50 border-red-300'
                    }`}>
                      <p className={`text-lg font-bold ${
                        carSpeeds[car.car_id].speed >= 280
                          ? 'text-green-600'
                          : carSpeeds[car.car_id].speed >= 220
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}>
                        {carSpeeds[car.car_id].speed.toFixed(1)} km/h
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Top Speed
                      </p>
                    </div>
                  )}
                  
                  <p className="text-gray-600">
                    <span className="font-semibold">Created:</span>{' '}
                    {new Date(car.created_at).toLocaleDateString()}
                  </p>
                  {car.last_trained && (
                    <p className="text-gray-600">
                      <span className="font-semibold">Last trained:</span>{' '}
                      {new Date(car.last_trained).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                {/* Test Speed Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    testCarSpeed(car.car_id)
                  }}
                  disabled={testingSpeed[car.car_id]}
                  className={`mt-3 w-full px-3 py-2 text-white rounded-lg text-xs font-semibold transition-colors ${
                    testingSpeed[car.car_id]
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {testingSpeed[car.car_id] ? '⏳ Testing...' : '🏁 Test Speed'}
                </button>
                
                {/* Sell Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    sellCar(car.car_id)
                  }}
                  disabled={sellingCar[car.car_id]}
                  className={`mt-2 w-full px-3 py-2 text-white rounded-lg text-xs font-semibold transition-colors ${
                    sellingCar[car.car_id]
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {sellingCar[car.car_id] ? '⏳ Selling...' : '💰 Sell Car (0.5 XRP)'}
                </button>
                
                {selectedCar === car.car_id && (
                  <div className="mt-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
                    Selected for Race
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {cars.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
          <p className="text-sm text-yellow-800 italic">
            💡 Each car has 10 hidden performance flags that affect its speed. Train your selected car to create a new variant with improved attributes (±20 points per training session). Training costs 1 XRP.
          </p>
        </div>
      )}
    </div>
  )
}

Garage.propTypes = {
  walletAddress: PropTypes.string,
  balance: PropTypes.string,
  wallet: PropTypes.object,
  onCarCreated: PropTypes.func,
  onBalanceChange: PropTypes.func,
  onCarSelected: PropTypes.func,
}

export default Garage
