export interface PayloadPostFriendsRequests {
  addresseeId: string
}

export interface DataFriends {
  id: string
  name: string
  email: string
  image: string
}

export interface DataFriendsRequestUser {
  id: string
  name: string
  email: string
  image: string
}

export interface DataFriendsRequests {
  id: string
  direction: 'incoming' | 'outgoing'
  user: DataFriendsRequestUser
  createdAt: string
}

export interface Friends {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataFriends[] | null
}

export interface FriendsRequests {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataFriendsRequests[] | null
}
