import { useState, useEffect } from 'react'

export function useTimer(isRunning: boolean) {
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isRunning) {
      setElapsedTime(0) // Reset timer when starting
      intervalId = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [isRunning])

  return elapsedTime
} 