import { useEffect, useMemo, useRef } from 'react'

export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingArgsRef = useRef<Args | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        // Flush any not-yet-fired save so unmounting (e.g. clicking "Back")
        // during the debounce window doesn't silently drop the last edit.
        if (pendingArgsRef.current) {
          callbackRef.current(...pendingArgsRef.current)
        }
      }
    }
  }, [])

  return useMemo(() => {
    return (...args: Args) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      pendingArgsRef.current = args
      timeoutRef.current = setTimeout(() => {
        pendingArgsRef.current = null
        callbackRef.current(...args)
      }, delayMs)
    }
  }, [delayMs])
}
