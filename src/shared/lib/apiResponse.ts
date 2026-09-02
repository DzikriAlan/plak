import type { NextApiResponse } from 'next'

export type ApiPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type ApiErrorDetails = Record<string, string[]> | null

// Selubung balasan dibuat satu pintu supaya seluruh endpoint memakai bentuk yang sama:
// sukses membawa data dan pesan, gagal membawa kode kesalahan yang bisa dibaca klien.
export const postApiSuccess = <T>(
  res: NextApiResponse,
  payload: { status?: number; data: T; message: string; pagination?: ApiPagination },
) => {
  const body: Record<string, unknown> = { success: true, data: payload.data }
  // Field yang tidak dipakai sengaja tidak ikut dikirim supaya balasan tetap ramping.
  if (payload.pagination) body.pagination = payload.pagination
  body.message = payload.message
  return res.status(payload.status ?? 200).json(body)
}

export const postApiError = (
  res: NextApiResponse,
  payload: { status: number; code: string; message: string; details?: ApiErrorDetails },
) =>
  res.status(payload.status).json({
    success: false,
    error: { code: payload.code, message: payload.message, details: payload.details ?? null },
  })

export const postApiMethodNotAllowed = (res: NextApiResponse, allowed: string) => {
  res.setHeader('Allow', allowed)
  return postApiError(res, {
    status: 405,
    code: 'METHOD_NOT_ALLOWED',
    message: `Only ${allowed} is allowed on this endpoint`,
  })
}
