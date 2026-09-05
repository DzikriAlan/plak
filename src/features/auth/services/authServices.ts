import { signIn, signOut } from 'next-auth/react'

// Login/logout memakai SDK next-auth langsung, sama seperti getGameRoomsStream membungkus
// EventSource: layer services tidak selalu berupa fetch ke API sendiri.
// callbackUrl dikunci ke '/friends' supaya cookie callback-url lama (mis. sisa percobaan yang
// gagal) tidak menarik pengguna kembali ke /login setelah masuk berhasil.
export const postAuthLogin = async () => {
  await signIn('google', { callbackUrl: '/friends' })
}

export const deleteAuthLogout = async () => {
  await signOut({ callbackUrl: '/' })
}
