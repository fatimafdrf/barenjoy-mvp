import { defineStore } from 'pinia'
import { ref } from 'vue'

export type UserRole = 'admin' | 'waiter' | 'kitchen' | 'bar'

export interface User {
  id: string
  username: string
  name: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref<boolean>(false)

  // Initialize from localStorage if exists
  const storedUser = localStorage.getItem('barenjoy_user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    } catch (e) {
      localStorage.removeItem('barenjoy_user')
    }
  }

  const login = async (role: UserRole): Promise<boolean> => {
    // Mock logins for each role
    const mockUsers: Record<UserRole, User> = {
      admin: { id: '1', username: 'admin', name: 'Administrador (Felipe)', role: 'admin' },
      waiter: { id: '2', username: 'camarero', name: 'Camarero (Sofía)', role: 'waiter' },
      kitchen: { id: '3', username: 'cocina', name: 'Chef Principal (Mateo)', role: 'kitchen' },
      bar: { id: '4', username: 'barra', name: 'Barman (Clara)', role: 'bar' },
    }

    const selectedUser = mockUsers[role]
    if (selectedUser) {
      user.value = selectedUser
      isAuthenticated.value = true
      localStorage.setItem('barenjoy_user', JSON.stringify(selectedUser))
      return true
    }
    return false
  }

  const logout = () => {
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('barenjoy_user')
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
  }
})
