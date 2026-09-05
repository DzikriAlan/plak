import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useFriendsStates } from '../states/friendsStates'
import {
  deleteFriends,
  getFriends,
  getFriendsRequests,
  patchFriendsRequests,
  postFriendsRequests,
} from '../services/friendsServices'
import type { PayloadPostFriendsRequests } from '../types/friendsTypes'

export const useFriendsControllers = () => {
  const { status: sessionStatus } = useSession()
  const queryClient = useQueryClient()
  const { friends, friendsRequests, setFriends, setFriendsRequests } = useFriendsStates()

  const fetchFriends = useQuery({
    queryKey: ['friends'],
    queryFn: () => getFriends(),
    enabled: sessionStatus === 'authenticated',
  })

  const fetchFriendsRequests = useQuery({
    queryKey: ['friendsRequests'],
    queryFn: () => getFriendsRequests(),
    enabled: sessionStatus === 'authenticated',
  })

  const storeFriendsRequests = useMutation({
    mutationFn: (payload: PayloadPostFriendsRequests) => postFriendsRequests(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendsRequests'] })
      queryClient.invalidateQueries({ queryKey: ['usersSearch'] })
    },
  })

  const modifyFriendsRequests = useMutation({
    mutationFn: (payload: { id: string; action: 'accept' | 'decline' }) => patchFriendsRequests(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendsRequests'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })

  const removeFriends = useMutation({
    mutationFn: (payload: { id: string }) => deleteFriends(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })

  useEffect(() => {
    if (fetchFriends.isPending) return
    const data = fetchFriends.data ?? null
    setFriends({ status: fetchFriends.isError ? 'error' : data?.length ? 'success' : 'empty', data })
  }, [fetchFriends.data, fetchFriends.isError, fetchFriends.isPending, setFriends])

  useEffect(() => {
    if (fetchFriendsRequests.isPending) return
    const data = fetchFriendsRequests.data ?? null
    setFriendsRequests({ status: fetchFriendsRequests.isError ? 'error' : data?.length ? 'success' : 'empty', data })
  }, [fetchFriendsRequests.data, fetchFriendsRequests.isError, fetchFriendsRequests.isPending, setFriendsRequests])

  return {
    friends,
    friendsRequests,
    fetchFriends,
    fetchFriendsRequests,
    storeFriendsRequests,
    modifyFriendsRequests,
    removeFriends,
  }
}
