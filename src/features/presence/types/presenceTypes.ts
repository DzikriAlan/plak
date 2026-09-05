export interface PayloadGetPresenceChannel {
  userId: string
  name: string
  image: string
}

export interface DataPresence {
  userId: string
  name: string
  image: string
}

export interface Presence {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataPresence[] | null
}
