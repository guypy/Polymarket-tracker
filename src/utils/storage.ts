import { AppState } from '../types'

const STORAGE_KEY = 'polymarket-tracker-state'

export function loadState(): AppState | null {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (!serializedState) {
      return null
    }
    return JSON.parse(serializedState)
  } catch (error) {
    console.error('Error loading state from localStorage:', error)
    return null
  }
}

export function saveState(state: AppState): void {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serializedState)
  } catch (error) {
    console.error('Error saving state to localStorage:', error)
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing state from localStorage:', error)
  }
}
