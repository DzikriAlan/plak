'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUsersStates } from '@/features/users/states/usersStates'
import { useUsersControllers } from '@/features/users/controllers/usersControllers'
import { useFriendsControllers } from '../controllers/friendsControllers'
import type { DataUsersSearch } from '@/features/users/types/usersTypes'

const schema = z.object({
  email: z.string().email(),
})

type FormValues = z.infer<typeof schema>

export default function FriendsAdd() {
  const { usersSearch, setGetUsersSearch } = useUsersStates()
  const { fetchUsersSearch } = useUsersControllers()
  const { storeFriendsRequests } = useFriendsControllers()
  const [filters, setFilters] = useState({
    search: '',
  })
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const data = useMemo(() => {
    const getResultLabel = (result: DataUsersSearch) => {
      if (result.friendStatus === 'friends') return 'Sudah berteman'
      if (result.friendStatus === 'pending_sent') return 'Menunggu'
      if (result.friendStatus === 'pending_received') return 'Terima di daftar permintaan'
      return 'Tambah'
    }

    const results = usersSearch.data ?? []

    return {
      results,
      isLoading: fetchUsersSearch.isFetching,
      isEmpty: usersSearch.status === 'empty' && filters.search.length > 2,
      getResultLabel,
    }
  }, [usersSearch, fetchUsersSearch.isFetching, filters.search])

  const submitFriendsAdd = form.handleSubmit((values) => {
    setFilters((prev) => ({ ...prev, search: values.email }))
    setGetUsersSearch({ email: values.email })
  })
  const submitFriendsRequests = (addresseeId: string) => {
    storeFriendsRequests.mutate({ addresseeId })
  }

  return (
    <div className="rounded-2xl border border-[#26262b] bg-[#121214] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#a29d93]">Tambah teman</p>

      <form onSubmit={submitFriendsAdd} className="mt-3 flex gap-2">
        <input
          type="email"
          placeholder="Cari lewat email"
          {...form.register('email')}
          className="w-full rounded-xl border border-[#26262b] bg-[#0a0a0b] px-3 py-2 text-[13px] text-[#f2ede1] outline-none focus:border-[#f2ede1]"
        />
        <button
          type="submit"
          disabled={data.isLoading}
          className="shrink-0 rounded-xl bg-[#f2ede1] px-4 py-2 text-[12px] font-semibold text-[#0a0a0b] disabled:opacity-50"
        >
          Cari
        </button>
      </form>

      {data.isEmpty ? <p className="mt-3 text-[12px] text-[#a29d93]">Tidak ada pengguna ditemukan.</p> : null}

      {data.results.length ? (
        <ul className="mt-3 flex flex-col gap-2">
          {data.results.map((result) => (
            <li
              key={result.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#26262b] px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-[#f2ede1]">{result.name || result.email}</p>
                <p className="truncate text-[11px] text-[#a29d93]">{result.email}</p>
              </div>
              <button
                type="button"
                disabled={result.friendStatus !== 'none' || storeFriendsRequests.isPending}
                onClick={() => submitFriendsRequests(result.id)}
                className="shrink-0 rounded-full border border-[#3a3a42] px-3 py-1.5 text-[11px] font-semibold text-[#f2ede1] disabled:opacity-40"
              >
                {data.getResultLabel(result)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
