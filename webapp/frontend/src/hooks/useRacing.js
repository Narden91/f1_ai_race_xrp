import { useCallback, useMemo, useState } from 'react'
import api from '../config/api'

/**
 * useRacing
 * Frontend state manager for the F1-AI racing game.
 * - Never stores or exposes secret flags.
 * - Talks to backend for training and racing.
 */
export const useRacing = (walletAddress, walletSeed, signAndSubmit) => {
  const [trainingCount, setTrainingCount] = useState(0)
  const [lastRace, setLastRace] = useState(null)
  const [raceStatus, setRaceStatus] = useState('idle') // idle | training | queued | racing | complete | error
  const [error, setError] = useState(null)
  const [lastSpeedTest, setLastSpeedTest] = useState(null) // { improved: boolean }
  const [carId, setCarId] = useState(null)

  const canRace = useMemo(() => raceStatus === 'idle' || raceStatus === 'complete', [raceStatus])

  // Generate or retrieve car ID based on wallet address
  useMemo(() => {
    if (walletAddress) {
      setCarId(`CAR-${walletAddress.slice(0, 6).toLowerCase()}`)
    }
  }, [walletAddress])

  const refreshLatestRace = useCallback(async () => {
    if (!walletAddress) return
    try {
      const data = await api.getLatestRace(walletAddress)
      if (data && data.race) {
        setLastRace(data.race)
        setRaceStatus('complete')
      }
    } catch (e) {
      // Silent fail; latest race may not exist yet
      console.debug('No latest race yet or backend not ready:', e?.message)
    }
  }, [walletAddress])

  const train = useCallback(async (carId, attributeIndices = null) => {
    if (!walletAddress) {
      setError('Connect a wallet first')
      return { success: false, error: 'No wallet' }
    }
    // Note: walletSeed may be null for GemWallet connections
    // Backend needs to handle this case or we need to sign transactions client-side
    if (!walletSeed && !signAndSubmit) {
      setError('No signing method available')
      return { success: false, error: 'No signing method' }
    }
    if (!carId) {
      setError('No car selected')
      return { success: false, error: 'No car selected' }
    }
    setError(null)
    setRaceStatus('training')
    try {
      const res = await api.trainCar(carId, walletAddress, walletSeed, attributeIndices)
      // Backend now processes payment internally via blockchain
      // For GemWallet, we may need to sign the transaction client-side
      if (res?.payment && signAndSubmit && !walletSeed) {
        // GemWallet path: sign transaction through wallet extension
        const tx = res.payment.txJSON || {
          TransactionType: 'Payment',
          Destination: res.payment.destination,
          Amount: res.payment.amount,
        }
        await signAndSubmit(tx)
      }
      
      if (res?.success) {
        setTrainingCount(res.training_count || trainingCount + 1)
        setRaceStatus('idle')
        return { 
          success: true, 
          trainedAttributes: res.trained_attributes,
          newCarId: res.car_id,  // New car ID after training
          speed: res.speed  // New car's speed
        }
      }
      throw new Error(res?.message || 'Training failed')
    } catch (e) {
      setRaceStatus('error')
      setError(e.message || 'Training failed')
      return { success: false, error: e.message }
    }
  }, [walletAddress, walletSeed, signAndSubmit, trainingCount])

  const testSpeed = useCallback(async (carId) => {
    if (!walletAddress) {
      setError('Connect a wallet first')
      return { success: false, error: 'No wallet' }
    }
    if (!carId) {
      setError('No car selected')
      return { success: false, error: 'No car selected' }
    }
    setError(null)
    setRaceStatus('testing')
    try {
      // Call backend to test speed - returns speed value and improvement status
      const res = await api.testSpeed(carId, walletAddress)
      if (res?.success) {
        // Backend returns { improved: true/false, speed: number, message: string }
        setLastSpeedTest({
          improved: res.improved || false,
          speed: res.speed,
          message: res.message,
          timestamp: new Date().toISOString()
        })
        setRaceStatus('idle')
        return { success: true, improved: res.improved, speed: res.speed, message: res.message }
      }
      throw new Error(res?.message || 'Speed test failed')
    } catch (e) {
      setRaceStatus('error')
      setError(e.message || 'Speed test failed')
      return { success: false, error: e.message }
    }
  }, [walletAddress])

  const enterRace = useCallback(async (carId) => {
    if (!walletAddress) {
      setError('Connect a wallet first')
      return { success: false, error: 'No wallet' }
    }
    if (!walletSeed && !signAndSubmit) {
      setError('No signing method available')
      return { success: false, error: 'No signing method' }
    }
    if (!carId) {
      setError('No car selected')
      return { success: false, error: 'No car selected' }
    }
    setError(null)
    setRaceStatus('racing')
    try {
      const res = await api.enterRace(carId, walletAddress, walletSeed)
      if (res?.payment && signAndSubmit && !walletSeed) {
        const tx = res.payment.txJSON || {
          TransactionType: 'Payment',
          Destination: res.payment.destination,
          Amount: res.payment.amount,
        }
        await signAndSubmit(tx)
      }
      if (res?.success) {
        // race: { race_id, car_id, your_rank, winner_car_id, total_participants, prize_awarded }
        const raceData = {
          id: res.race_id,
          winner: res.winner_car_id,
          winnerCarId: res.winner_car_id,
          yourRank: res.your_rank,
          participants: res.total_participants,
          prizeAwarded: res.prize_awarded
        }
        setLastRace(raceData)
        setRaceStatus('complete')
        return { success: true, race: raceData }
      }
      throw new Error(res?.message || 'Race failed')
    } catch (e) {
      setRaceStatus('error')
      setError(e.message || 'Race failed')
      return { success: false, error: e.message }
    }
  }, [walletAddress, walletSeed, signAndSubmit])

  return {
    trainingCount,
    lastRace,
    raceStatus,
    error,
    canRace,
    lastSpeedTest,
    carId,
    train,
    testSpeed,
    enterRace,
    refreshLatestRace,
  }
}
