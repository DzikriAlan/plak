export interface DataAuth {
  id: string
  name: string
  email: string
  image: string
}

export interface Auth {
  status: string
  statusTitle: string
  statusSubtitle: string
  data: DataAuth | null
}
