import { usersRepository } from './repository'
import type { NewUser, UpdateUser } from './types'

export const usersService = {
  getAll: () => usersRepository.findAll(),

  getById: async (id: string) => {
    const user = await usersRepository.findById(id)
    if (!user) throw new Error(`Usuário com id ${id} não encontrado`)
    return user
  },

  create: async (data: NewUser) => {
    const existing = await usersRepository.findByEmail(data.email)
    if (existing) throw new Error(`Usuário com email ${data.email} já existe`)
    return usersRepository.create(data)
  },

  update: async (id: string, data: UpdateUser) => {
    await usersService.getById(id)
    return usersRepository.update(id, data)
  },

  delete: async (id: string) => {
    await usersService.getById(id)
    return usersRepository.delete(id)
  },
}
