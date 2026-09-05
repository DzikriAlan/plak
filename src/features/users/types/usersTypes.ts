export interface PayloadGetUsersSearch {
  email: string
}

export interface DataUsersMe {
  id: string
  name: string
  email: string
  image: string
}

export type FriendStatus = 'none' | 'pending_sent' | 'pending_received' | 'friends'

export interface DataUsersSearch {
  id: string
  name: string
  email: string
  image: string
  friendStatus: FriendStatus
}

export interface UsersMe {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataUsersMe | null
}

export interface UsersSearch {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataUsersSearch[] | null
}
