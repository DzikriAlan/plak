import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useUsersStates } from '../states/usersStates'
import { getUsersMe, getUsersSearch } from '../services/usersServices'

export const useUsersControllers = () => {
  const { status: sessionStatus } = useSession()
  const { payloadGetUsersSearch, setUsersMe, setUsersSearch } = useUsersStates()

  const fetchUsersMe = useQuery({
    queryKey: ['usersMe'],
    queryFn: () => getUsersMe(),
    enabled: sessionStatus === 'authenticated',
  })

  const fetchUsersSearch = useQuery({
    queryKey: ['usersSearch', payloadGetUsersSearch],
    queryFn: () => getUsersSearch(payloadGetUsersSearch),
    enabled: sessionStatus === 'authenticated' && payloadGetUsersSearch.email.length > 2,
  })

  useEffect(() => {
    if (fetchUsersMe.isPending) return
    const data = fetchUsersMe.data ?? null
    setUsersMe({ status: fetchUsersMe.isError ? 'error' : data ? 'success' : 'empty', data })
  }, [fetchUsersMe.data, fetchUsersMe.isError, fetchUsersMe.isPending, setUsersMe])

  useEffect(() => {
    if (fetchUsersSearch.isPending) return
    const data = fetchUsersSearch.data ?? null
    setUsersSearch({ status: fetchUsersSearch.isError ? 'error' : data?.length ? 'success' : 'empty', data })
  }, [fetchUsersSearch.data, fetchUsersSearch.isError, fetchUsersSearch.isPending, setUsersSearch])

  return { fetchUsersMe, fetchUsersSearch }
}
