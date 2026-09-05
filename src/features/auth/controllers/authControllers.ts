import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'
import { postAuthLogin, deleteAuthLogout } from '../services/authServices'
import type { Auth } from '../types/authTypes'

const emptyState: Auth = {
  status: 'loading',
  statusTitle: 'Something went wrong',
  statusSubtitle: 'Please try again later.',
  data: null,
}

// Sesi sudah dijaga oleh SessionProvider di _app.tsx, jadi tidak perlu Zustand sebagai salinan
// kedua yang bisa basi; controller ini hanya memetakan bentuknya ke bentuk status baku fitur lain.
export const useAuthControllers = () => {
  const { data: session, status } = useSession()

  const auth = useMemo<Auth>(() => {
    if (status === 'loading') return emptyState
    if (status === 'unauthenticated' || !session?.user) {
      return { ...emptyState, status: 'empty' }
    }
    return {
      ...emptyState,
      status: 'success',
      data: {
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        image: session.user.image ?? '',
      },
    }
  }, [session, status])

  const storeAuthLogin = useMutation({
    mutationFn: () => postAuthLogin(),
  })

  const removeAuthLogout = useMutation({
    mutationFn: () => deleteAuthLogout(),
  })

  return { auth, storeAuthLogin, removeAuthLogout }
}
