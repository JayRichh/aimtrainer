import { UserProfile } from '../types'

export function loadUserProfile(): UserProfile | null {
  if (typeof window !== 'undefined') {
    const profile = localStorage.getItem('userProfile')
    if (profile) {
      return JSON.parse(profile)
    }
  }
  return null
}

export function saveUserProfile(profile: UserProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userProfile', JSON.stringify(profile))
  }
}

export default { loadUserProfile, saveUserProfile }