import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type { users } from '@/database/schema'

export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
export type UpdateUser = Partial<Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>>
