'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone, Tablet, Monitor, RotateCcw, Wifi, WifiOff, 
  Battery, BatteryCharging, Zap, Globe, Globe2, Settings,
  SmartphoneIcon, TabletIcon, MonitorIcon
} from 'lucide-react'

interface DeviceConfig {
  name: string
  width: number
  height: number
  icon: React.ComponentType<any>
  userAgent: string
}

interface NetworkConfig {
  name: string
  speed: number
  latency: number
  offline: boolean
  icon: React.ComponentType<any>
}

interface BatteryConfig {
  level: number
  charging: boolean
  icon: React.ComponentType<any>
}

const DEVICES: DeviceConfig[] = [
  {
    name: 'iPhone 14 Pro',
    width: 393,
    height: 852,
    icon: SmartphoneIcon,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'iPhone 14 Pro Max',
    width: 430,
    height: 932,
    icon: SmartphoneIcon,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Samsung Galaxy S23',
    width: 360,
    height: 780,
    icon: SmartphoneIcon,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
  },
  {
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    icon: TabletIcon,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Desktop',
    width: 1440,
    height: 900,
    icon: MonitorIcon,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
  }
]

const NETWORKS: NetworkConfig[] = [
  {
    name: '5G',
    speed: 1000,
    latency: 10,
    offline: false,
    icon: Zap
  },
  {
    name: '4G',
    speed: 100,
    latency: 50,
    offline: false,
    icon: Globe
  },
  {
    name: '3G',
    speed: 10,
    latency: 200,
    offline: false,
    icon: Globe2
  },
  {
    name: 'Slow 3G',
    speed: 1,
    latency: 500,
    offline: false,
    icon: Globe2
  },
  {
    name: 'Offline',
    speed: 0,
    latency: 0,
    offline: true,
    icon: WifiOff
  }
]

export function MobileSimulator() {
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(DEVICES[0])
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(NETWORKS[0])
  const [batteryLevel, setBatteryLevel] = useState<number>(85)
  const [isCharging, setIsCharging] = useState<boolean>(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [simulationStats, setSimulationStats] = useState<{
    loadTime: number
    errors: number
    warnings: number
    performance: number
  }>({
    loadTime: 0,
    errors: 0,
    warnings: 0,
    performance: 0
  })

  // Simulate device characteristics
  useEffect(() => {
    if (!isSimulating || typeof window === 'undefined') return

    // Simulate network conditions
    if (selectedNetwork.offline) {
      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })
      window.dispatchEvent(new Event('offline'))
    } else {
      // Simulate slow network
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })
      window.dispatchEvent(new Event('online'))
    }

    // Simulate battery level
    if ('getBattery' in navigator) {
      // Mock battery API
      Object.defineProperty(navigator, 'getBattery', {
        writable: true,
        value: () => Promise.resolve({
          level: batteryLevel / 100,
          charging: isCharging,
          addEventListener: () => {},
          removeEventListener: () => {}
        })
      })
    }

    // Simulate user agent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: selectedDevice.userAgent
    })

    // Simulate screen dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: orientation === 'portrait' ? selectedDevice.width : selectedDevice.height
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: orientation === 'portrait' ? selectedDevice.height : selectedDevice.width
    })

    // Simulate viewport
    Object.defineProperty(window, 'visualViewport', {
      writable: true,
      value: {
        width: orientation === 'portrait' ? selectedDevice.width : selectedDevice.height,
        height: orientation === 'portrait' ? selectedDevice.height : selectedDevice.width,
        scale: 1
      }
    })

  }, [selectedDevice, selectedNetwork, batteryLevel, isCharging, orientation, isSimulating])

  // Start simulation
  const startSimulation = () => {
    setIsSimulating(true)
    const startTime = Date.now()

    // Simulate app loading and performance testing
    setTimeout(() => {
      const endTime = Date.now()
      const loadTime = endTime - startTime

      // Simulate performance metrics
      const performanceScore = Math.max(0, 100 - (loadTime / 100))
      const errors = Math.floor(Math.random() * 3)
      const warnings = Math.floor(Math.random() * 5)

      setSimulationStats({
        loadTime: Math.round(loadTime),
        errors,
        warnings,
        performance: Math.round(performanceScore)
      })

      // Show simulation results
      toast.success('Simulation completed!', {
        description: `Load time: ${Math.round(loadTime)}ms, Performance: ${Math.round(performanceScore)}%`
      })
    }, 2000)
  }

  // Stop simulation
  const stopSimulation = () => {
    setIsSimulating(false)
    
    // Reset to default values
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: navigator.userAgent
    })
  }

  // Toggle orientation
  const toggleOrientation = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait')
  }

  // Get battery icon
  const getBatteryIcon = () => {
    if (isCharging) return BatteryCharging
    if (batteryLevel <= 20) return Battery
    if (batteryLevel <= 50) return Battery
    return Battery
  }

  const BatteryIcon = getBatteryIcon()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile Device Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Device Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Device Type</label>
            <Select value={selectedDevice.name} onValueChange={(value) => {
              const device = DEVICES.find(d => d.name === value)
              if (device) setSelectedDevice(device)
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEVICES.map((device) => (
                  <SelectItem key={device.name} value={device.name}>
                    <div className="flex items-center gap-2">
                      <device.icon className="h-4 w-4" />
                      {device.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Network Conditions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Network Conditions</label>
            <Select value={selectedNetwork.name} onValueChange={(value) => {
              const network = NETWORKS.find(n => n.name === value)
              if (network) setSelectedNetwork(network)
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NETWORKS.map((network) => (
                  <SelectItem key={network.name} value={network.name}>
                    <div className="flex items-center gap-2">
                      <network.icon className="h-4 w-4" />
                      {network.name}
                      {!network.offline && (
                        <span className="text-xs text-gray-500">
                          {network.speed}Mbps, {network.latency}ms
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Battery Simulation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Battery Level</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <BatteryIcon className="h-4 w-4" />
                <span className="text-sm">{batteryLevel}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={batteryLevel}
                onChange={(e) => setBatteryLevel(Number(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={isCharging}
                  onCheckedChange={setIsCharging}
                />
                <span className="text-sm">Charging</span>
              </div>
            </div>
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Orientation</label>
            <Button
              variant="outline"
              onClick={toggleOrientation}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
            </Button>
          </div>

          {/* Simulation Controls */}
          <div className="flex gap-2">
            <Button
              onClick={startSimulation}
              disabled={isSimulating}
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Simulation
            </Button>
            <Button
              onClick={stopSimulation}
              disabled={!isSimulating}
              variant="outline"
              className="flex-1"
            >
              <Settings className="h-4 w-4 mr-2" />
              Stop
            </Button>
          </div>

          {/* Simulation Results */}
          {simulationStats.loadTime > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Simulation Results</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Load Time:</span>
                  <Badge variant={simulationStats.loadTime < 1000 ? 'default' : 'destructive'}>
                    {simulationStats.loadTime}ms
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Performance:</span>
                  <Badge variant={simulationStats.performance > 80 ? 'default' : 'destructive'}>
                    {simulationStats.performance}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Errors:</span>
                  <Badge variant={simulationStats.errors === 0 ? 'default' : 'destructive'}>
                    {simulationStats.errors}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Warnings:</span>
                  <Badge variant={simulationStats.warnings === 0 ? 'default' : 'secondary'}>
                    {simulationStats.warnings}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Device Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Device Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="text-center text-sm text-gray-500 mb-2">
              {selectedDevice.name} - {orientation}
            </div>
            <div 
              className="mx-auto border border-gray-400 bg-white shadow-lg overflow-hidden"
              style={{
                width: orientation === 'portrait' ? selectedDevice.width / 4 : selectedDevice.height / 4,
                height: orientation === 'portrait' ? selectedDevice.height / 4 : selectedDevice.width / 4,
                maxWidth: '100%',
                maxHeight: '300px'
              }}
            >
              <div className="bg-gray-800 text-white text-xs p-1 text-center">
                {selectedNetwork.name} {!selectedNetwork.offline && `(${selectedNetwork.speed}Mbps)`}
              </div>
              <div className="p-2 text-center">
                <div className="text-xs text-gray-600">DailyMood AI</div>
                <div className="text-xs text-gray-400 mt-1">
                  Battery: {batteryLevel}% {isCharging && '⚡'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Toast notification component (simplified)
const toast = {
  success: (message: string, options?: any) => {
    console.log('✅', message, options)
  }
}
