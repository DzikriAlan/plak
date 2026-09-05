// Pasangan diurutkan supaya A->B dan B->A selalu memetakan ke kunci unik yang sama di database,
// mencegah dua baris permintaan pertemanan dibuat untuk pasangan pengguna yang sama.
export const getFriendPairIds = (userIdA: string, userIdB: string) => {
  const [userMinId, userMaxId] = [userIdA, userIdB].sort()
  return { userMinId, userMaxId }
}
