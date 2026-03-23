'use client'
import { useState, useCallback, useRef } from 'react'
import { collectSignals, type FingerprintSignals } from '@/lib/fingerprint/collector'
import { calculatePLS, type PLSResult } from '@/lib/fingerprint/pls-calculator'

export type ScanState = 'IDLE' | 'SCANNING' | 'RESULTS'

export interface ScanData {
  state:          ScanState
  signals:        FingerprintSignals | null
  pls:            PLSResult | null
  currentStep:    string
  completedSteps: string[]
  fingerprintId:  string
  startScan:      () => Promise<void>
  reset:          () => void
}

// Deterministic stable ID — same browser = same ID every time
// Uses the canvas hash as base (most stable signal)
function makeFingerprintId(signals: FingerprintSignals): string {
  if (!signals.canvas.blocked && signals.canvas.hash.length >= 8) {
    // Take 8 hex chars from the real SHA-256 canvas hash
    return 'fp_' + signals.canvas.hash.substring(0, 8)
  }
  // Fallback if canvas is blocked: combine webgl + audio + timezone
  const fallback = (
    signals.webgl.renderer.replace(/\s+/g, '').substring(0, 6) +
    signals.audio.hash.substring(0, 6) +
    signals.timezone.zone.replace(/\//g, '').substring(0, 4)
  ).toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8).padEnd(8, '0')
  return 'fp_' + fallback
}

export function useScan(): ScanData {
  const [state,          setState         ] = useState<ScanState>('IDLE')
  const [signals,        setSignals       ] = useState<FingerprintSignals | null>(null)
  const [pls,            setPls           ] = useState<PLSResult | null>(null)
  const [currentStep,    setCurrentStep   ] = useState('')
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [fingerprintId,  setFingerprintId ] = useState('')
  const scanning = useRef(false)

  const startScan = useCallback(async () => {
    if (scanning.current) return
    scanning.current = true
    setState('SCANNING')
    setCompletedSteps([])
    setCurrentStep('')

    try {
      const collected = await collectSignals(step => {
        setCurrentStep(step)
        if (step !== 'Complete!') {
          setCompletedSteps(prev =>
            prev[prev.length - 1] === step ? prev : [...prev, step]
          )
        }
      })

      await new Promise(r => setTimeout(r, 400)) // small pause before results

      const plsResult = calculatePLS(collected)
      const fpId      = makeFingerprintId(collected)

      setSignals(collected)
      setPls(plsResult)
      setFingerprintId(fpId)
      setState('RESULTS')
    } catch (err) {
      console.error('FingerprintIQ scan error:', err)
      setState('IDLE')
    } finally {
      scanning.current = false
    }
  }, [])

  const reset = useCallback(() => {
    setState('IDLE')
    setSignals(null)
    setPls(null)
    setCurrentStep('')
    setCompletedSteps([])
    setFingerprintId('')
    scanning.current = false
  }, [])

  return {
    state, signals, pls,
    currentStep, completedSteps,
    fingerprintId,
    startScan, reset,
  }
}
