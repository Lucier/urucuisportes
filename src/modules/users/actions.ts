'use server'

import { revalidatePath } from 'next/cache'
import { usersService } from './service'
import type { NewUser, UpdateUser } from './types'

export async function getUsers() {
  return usersService.getAll()
}

export async function getUserById(id: string) {
  return usersService.getById(id)
}

export async function createUser(data: NewUser) {
  const user = await usersService.create(data)
  revalidatePath('/users')
  return user
}

export async function updateUser(id: string, data: UpdateUser) {
  const user = await usersService.update(id, data)
  revalidatePath('/users')
  return user
}

export async function deleteUser(id: string) {
  await usersService.delete(id)
  revalidatePath('/users')
}
