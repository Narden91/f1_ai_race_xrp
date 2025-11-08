import { useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

// Main Component with Overlay and 3D Canvas
export default function RaceSimulation3D({ isOpen, onClose, playerCar, onRaceFinish }) {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const [racers, setRacers] = useState([])
  const [countdown, setCountdown] = useState(3)
  const [raceStarted, setRaceStarted] = useState(false)
  const [raceFinished, setRaceFinished] = useState(false)
  const [finalRanking, setFinalRanking] = useState([])
  const [showResults, setShowResults] = useState(false)

  // Generate opponents
  useEffect(() => {
    if (isOpen && racers.length === 0) {
      const opponentNames = [
        'Lightning Max', 'Turbo Sam', 'Speed Demon', 'Nitro Knight',
        'Velocity Viper', 'Thunder Bolt', 'Sonic Racer', 'Hyper Drive'
      ]
      
      const opponentColors = [
        0xFF0000, 0x0000FF, 0x00FF00, 0xFFFF00, 
        0xFF00FF, 0x00FFFF, 0xFFA500, 0x800080
      ]
      
      // Select 4 random opponents
      const numOpponents = 4
      const selectedOpponents = []
      const usedIndices = new Set()
      
      while (selectedOpponents.length < numOpponents) {
        const idx = Math.floor(Math.random() * opponentNames.length)
        if (!usedIndices.has(idx)) {
          usedIndices.add(idx)
          // Make opponents competitive - give them better speed on average
          selectedOpponents.push({
            id: `opponent-${idx}`,
            name: opponentNames[idx],
            color: opponentColors[idx],
            speed: 2.8 + Math.random() * 1.4, // 2.8 to 4.2 - competitive but beatable
            isPlayer: false,
          })
        }
      }
      
      // Add player car - player can win if they have good speed
      const playerSpeed = playerCar.speed || 3.0
      const allRacers = [
        {
          id: playerCar.id,
          name: 'You',
          color: 0xFFD700, // Gold
          speed: playerSpeed,
          isPlayer: true,
        },
        ...selectedOpponents,
      ]
      
      // Randomize starting positions
      const shuffled = allRacers.sort(() => Math.random() - 0.5)
      setRacers(shuffled)
    }
  }, [isOpen, racers.length, playerCar])

  // Countdown timer
  useEffect(() => {
    if (isOpen && racers.length > 0 && !raceStarted && !raceFinished) {
      let count = 3
      setCountdown(count)
      
      const countdownInterval = setInterval(() => {
        count--
        if (count > 0) {
          setCountdown(count)
        } else {
          setCountdown(0)
          setRaceStarted(true)
          clearInterval(countdownInterval)
        }
      }, 1000)
      
      return () => clearInterval(countdownInterval)
    }
  }, [isOpen, racers.length, raceStarted, raceFinished])

  // Three.js Scene Setup
  useEffect(() => {
    if (!isOpen || !raceStarted || racers.length === 0 || !canvasRef.current) return

    const canvas = canvasRef.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB) // Sky blue
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200)

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 10, -35)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Enhanced Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
    directionalLight.position.set(10, 25, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -30
    directionalLight.shadow.camera.right = 30
    directionalLight.shadow.camera.top = 30
    directionalLight.shadow.camera.bottom = -30
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Add hemisphere light for better ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.5)
    scene.add(hemisphereLight)

    // Enhanced Track with gradient
    const trackGeometry = new THREE.PlaneGeometry(20, 200)
    const trackMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.9,
      metalness: 0.1
    })
    const track = new THREE.Mesh(trackGeometry, trackMaterial)
    track.rotation.x = -Math.PI / 2
    track.receiveShadow = true
    scene.add(track)

    // Track edge lines
    const edgeLineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    const edgeLineGeometry = new THREE.PlaneGeometry(0.2, 200)
    
    const leftEdge = new THREE.Mesh(edgeLineGeometry, edgeLineMaterial)
    leftEdge.rotation.x = -Math.PI / 2
    leftEdge.position.set(-9.9, 0.01, 0)
    scene.add(leftEdge)
    
    const rightEdge = leftEdge.clone()
    rightEdge.position.set(9.9, 0.01, 0)
    scene.add(rightEdge)

    // Track center dashed lines
    const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 })
    for (let i = 0; i < 40; i++) {
      const dashGeometry = new THREE.PlaneGeometry(0.3, 2.5)
      const dash = new THREE.Mesh(dashGeometry, dashMaterial)
      dash.rotation.x = -Math.PI / 2
      dash.position.set(0, 0.01, i * 5 - 90)
      scene.add(dash)
    }

    // Enhanced Side barriers with reflective material
    const barrierGeometry = new THREE.BoxGeometry(0.5, 1, 200)
    const barrierMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      metalness: 0.6,
      roughness: 0.3,
      emissive: 0x330000,
      emissiveIntensity: 0.2
    })
    const barrier1 = new THREE.Mesh(barrierGeometry, barrierMaterial)
    barrier1.position.set(-10, 0.5, 0)
    barrier1.castShadow = true
    scene.add(barrier1)
    
    const barrier2 = barrier1.clone()
    barrier2.position.set(10, 0.5, 0)
    scene.add(barrier2)

    // Starting grid
    const gridMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    for (let i = 0; i < 5; i++) {
      const gridGeometry = new THREE.PlaneGeometry(1.8, 0.4)
      const grid = new THREE.Mesh(gridGeometry, gridMaterial)
      grid.rotation.x = -Math.PI / 2
      grid.position.set(i * 2.5 - 5, 0.02, -75)
      scene.add(grid)
    }

    // Checkered finish line pattern
    const finishLineGroup = new THREE.Group()
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 3; j++) {
        const isWhite = (i + j) % 2 === 0
        const squareGeometry = new THREE.PlaneGeometry(1, 1)
        const squareMaterial = new THREE.MeshBasicMaterial({ 
          color: isWhite ? 0xFFFFFF : 0x000000 
        })
        const square = new THREE.Mesh(squareGeometry, squareMaterial)
        square.rotation.x = -Math.PI / 2
        square.position.set(i - 10, 0.02, j - 1)
        finishLineGroup.add(square)
      }
    }
    finishLineGroup.position.z = 100
    scene.add(finishLineGroup)

    // Create enhanced cars
    const lanes = [-6, -3, 0, 3, 6]
    const carObjects = racers.map((racer, index) => {
      const carGroup = new THREE.Group()
      
      // Car body with enhanced material
      const bodyGeometry = new THREE.BoxGeometry(0.8, 0.4, 1.5)
      const bodyMaterial = new THREE.MeshStandardMaterial({ 
        color: racer.color,
        metalness: 0.9,
        roughness: 0.1,
        emissive: racer.color,
        emissiveIntensity: racer.isPlayer ? 0.3 : 0.1
      })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.position.y = 0.3
      body.castShadow = true
      carGroup.add(body)
      
      // Car nose with gradient
      const noseGeometry = new THREE.ConeGeometry(0.4, 0.6, 4)
      const nose = new THREE.Mesh(noseGeometry, bodyMaterial)
      nose.position.set(0, 0.25, 1)
      nose.rotation.x = Math.PI / 2
      nose.castShadow = true
      carGroup.add(nose)
      
      // Cockpit (darker area)
      const cockpitGeometry = new THREE.BoxGeometry(0.5, 0.2, 0.8)
      const cockpitMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x111111,
        metalness: 0.8,
        roughness: 0.2
      })
      const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial)
      cockpit.position.set(0, 0.5, 0.2)
      cockpit.castShadow = true
      carGroup.add(cockpit)
      
      // Spoiler
      const spoilerGeometry = new THREE.BoxGeometry(0.9, 0.05, 0.3)
      const spoilerMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 0.1
      })
      const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial)
      spoiler.position.set(0, 0.7, -0.7)
      spoiler.castShadow = true
      carGroup.add(spoiler)
      
      // Wheels with better detail
      const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16)
      const wheelMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a1a,
        metalness: 0.3,
        roughness: 0.7
      })
      const wheelPositions = [
        [-0.4, 0, 0.5], [0.4, 0, 0.5],
        [-0.4, 0, -0.5], [0.4, 0, -0.5]
      ]
      
      wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
        wheel.position.set(...pos)
        wheel.rotation.z = Math.PI / 2
        wheel.castShadow = true
        carGroup.add(wheel)
      })
      
      // Add glow effect for player car
      if (racer.isPlayer) {
        const glowGeometry = new THREE.SphereGeometry(1.2, 16, 16)
        const glowMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xFFD700,
          transparent: true,
          opacity: 0.1
        })
        const glow = new THREE.Mesh(glowGeometry, glowMaterial)
        glow.position.y = 0.3
        carGroup.add(glow)
      }
      
      carGroup.position.set(lanes[index], 0.5, -80)
      scene.add(carGroup)
      
      return {
        group: carGroup,
        racer: racer,
        progress: 0,
        finished: false,
        finishTime: null
      }
    })

    sceneRef.current = { scene, camera, renderer, carObjects }

    // Animation loop
    let animationFrameId
    const startTime = Date.now()
    const finishLine = 100
    const finishOrder = []
    
    const animate = () => {
      const elapsedTime = (Date.now() - startTime) / 1000
      
      let allFinished = true
      let leadZ = -80
      
      carObjects.forEach(carObj => {
        if (!carObj.finished) {
          // Move car forward based on speed
          carObj.progress = carObj.racer.speed * elapsedTime * 12
          const newZ = -80 + carObj.progress
          
          if (newZ < finishLine) {
            carObj.group.position.z = newZ
            allFinished = false
            
            // Track lead car
            if (newZ > leadZ) {
              leadZ = newZ
            }
            
            // Add slight wobble and wheel rotation effect
            carObj.group.rotation.y = Math.sin(elapsedTime * 3 + carObj.racer.speed) * 0.03
            
            // Simulate wheel spinning
            carObj.group.children.forEach(child => {
              if (child.geometry && child.geometry.type === 'CylinderGeometry') {
                child.rotation.x += carObj.racer.speed * 0.1
              }
            })
          } else if (!carObj.finished) {
            carObj.group.position.z = finishLine
            carObj.finished = true
            carObj.finishTime = elapsedTime
            finishOrder.push({
              ...carObj.racer,
              finishTime: elapsedTime,
              rank: finishOrder.length + 1
            })
          }
        }
      })
      
      // Update camera to follow lead car smoothly
      const targetCameraZ = leadZ - 15
      const targetCameraY = 10
      camera.position.z += (targetCameraZ - camera.position.z) * 0.05
      camera.position.y += (targetCameraY - camera.position.y) * 0.02
      camera.lookAt(0, 0, leadZ + 5)
      
      renderer.render(scene, camera)
      
      if (allFinished && !raceFinished) {
        setRaceFinished(true)
        setFinalRanking(finishOrder)
        setShowResults(true)
        
        // Wait 3 seconds to show results before calling onRaceFinish
        setTimeout(() => {
          const playerResult = finishOrder.find(r => r.isPlayer)
          const playerRank = playerResult ? playerResult.rank : finishOrder.length
          const winner = finishOrder[0]
          
          onRaceFinish({
            playerRank,
            winner: winner.id,
            winnerName: winner.name,
            totalParticipants: racers.length,
            prizeAwarded: playerRank === 1, // Prize awarded if player wins
          })
        }, 3000)
      } else {
        animationFrameId = requestAnimationFrame(animate)
      }
    }
    
    animate()

    // Handle window resize
    const handleResize = () => {
      if (canvas) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      renderer.dispose()
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
    }
  }, [isOpen, raceStarted, racers, onRaceFinish, raceFinished])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRacers([])
      setCountdown(3)
      setRaceStarted(false)
      setRaceFinished(false)
      setFinalRanking([])
      setShowResults(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
        <div className="relative w-full h-full bg-gradient-to-b from-sky-200 to-sky-400 rounded-2xl overflow-hidden shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all"
          >
            ✕ Close
          </button>
          
          {/* Countdown Overlay */}
          {countdown > 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-9xl font-bold text-white animate-pulse drop-shadow-2xl">
                {countdown}
              </div>
            </div>
          )}
          
          {/* Race Results Overlay */}
          {showResults && finalRanking.length > 0 && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-70">
              <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🏁</div>
                  <h2 className="text-4xl font-bold text-gray-800 mb-2">Race Complete!</h2>
                </div>
                
                {/* Final Rankings */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-bold text-gray-700 mb-3 text-center">Final Rankings</h3>
                  {finalRanking.map((racer, index) => (
                    <div 
                      key={racer.id}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        racer.isPlayer 
                          ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400' 
                          : index === 0
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="text-2xl font-bold w-8">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div 
                        className="w-6 h-6 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: `#${racer.color.toString(16).padStart(6, '0')}` }}
                      ></div>
                      <div className="flex-1">
                        <div className={`font-bold ${racer.isPlayer ? 'text-yellow-900' : 'text-gray-800'}`}>
                          {racer.name} {racer.isPlayer && '⭐'}
                        </div>
                        <div className="text-xs text-gray-600">
                          Time: {racer.finishTime.toFixed(2)}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Player Result Message */}
                <div className={`text-center p-4 rounded-lg border ${
                  finalRanking.find(r => r.isPlayer)?.rank === 1
                    ? 'bg-green-50 border-green-300'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`text-sm font-semibold ${
                    finalRanking.find(r => r.isPlayer)?.rank === 1
                      ? 'text-green-900'
                      : 'text-blue-800'
                  }`}>
                    {finalRanking.find(r => r.isPlayer)?.rank === 1 
                      ? '🎉 Congratulations! You won 100 XRP!'
                      : `You finished in position #${finalRanking.find(r => r.isPlayer)?.rank}. Keep training to improve your speed!`
                    }
                  </p>
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={onClose}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Race Info Panel */}
          {!showResults && (
            <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg max-w-xs">
              <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                🏁 Race Progress
              </h2>
              <div className="space-y-2 text-sm">
                {racers
                  .sort((a, b) => b.speed - a.speed)
                  .map((racer, index) => (
                    <div 
                      key={racer.id} 
                      className={`flex items-center gap-2 p-2 rounded ${
                        racer.isPlayer 
                          ? 'bg-yellow-100 font-bold text-yellow-900' 
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: `#${racer.color.toString(16).padStart(6, '0')}` }}
                        ></div>
                        <span className="truncate">
                          {racer.isPlayer && '⭐ '}
                          {racer.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">
                  💡 Train your car to increase speed and win more races!
                </p>
              </div>
            </div>
          )}
          
          {/* 3D Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: raceStarted ? 'block' : 'none' }}
          />
          
          {/* Starting Grid View */}
          {!raceStarted && countdown === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-4xl font-bold animate-pulse">
                Get Ready...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

RaceSimulation3D.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  playerCar: PropTypes.shape({
    id: PropTypes.string.isRequired,
    speed: PropTypes.number,
  }).isRequired,
  onRaceFinish: PropTypes.func.isRequired,
}
