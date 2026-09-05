export interface PayloadPostGameInvites {
  toUserId: string
  roomCode: string
  game: string
}

export interface DataGameInvites {
  fromUserId: string
  fromName: string
  fromImage: string
  roomCode: string
  game: string
  sentAt: string
}

export interface GameInvites {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataGameInvites | null
}
