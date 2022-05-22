import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { authApi } from '@/api'
import useSWR from 'swr'
import { PublicConfiguration } from 'swr/dist/types'

interface UserInfo {
  username: string
  id: string
}

// Auth --> Protected Pages
// <Auth>{children}</Auth>
export function useAuth(
  { middleware }: any = {},
  options?: Partial<PublicConfiguration>
) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)

  const {
    data: user,
    error,
    mutate,
  } = useSWR('/users', {
    dedupingInterval: 60 * 60 * 1000, // 1hr
    revalidateOnFocus: false,
    ...options,
  })

  const firstLoading = user === undefined && error === undefined

  async function login(
    loginData: { username: string; password: string }
  ) {
    await authApi
      .login(loginData)
    await mutate()
  }

  async function register(
    loginData: { username: string; password: string, confirmPassword: string, referal: string }
  ) {
    await authApi
      .register(loginData)

    await mutate()
  }

  async function logout() {
    await authApi.logout()
    mutate(null, false)
    router.push('/')
  }

  useEffect(() => {
    if (user || error) setIsLoading(false)
    if (middleware == 'guest' && user) router.push('/dashboard')
    if (middleware == 'auth' && error) router.push('/login')
  })

  return {
    user: user as UserInfo,
    error,
    login,
    register,
    logout,
    isLoading,
    firstLoading,
  }
}
