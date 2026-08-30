export type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type PaginationParams = {
  page?: number
  pageSize?: number
}
