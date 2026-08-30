import { hashSync } from 'bcryptjs'
import { db } from './client'
import { users } from './schema'

const SALT_ROUNDS = 10

const seedUsers = [
  {
    name: 'Admin',
    email: 'admin@urucuisportes.com',
    password: hashSync('Admin@123!', SALT_ROUNDS),
    role: 'ADMIN' as const,
  },
  {
    name: 'João Silva',
    email: 'joao.silva@urucuisportes.com',
    password: hashSync('User@123!', SALT_ROUNDS),
    role: 'USER' as const,
  },
  {
    name: 'Maria Souza',
    email: 'maria.souza@urucuisportes.com',
    password: hashSync('User@123!', SALT_ROUNDS),
    role: 'USER' as const,
  },
]

async function seed() {
  console.log('Seeding database...')

  await db.delete(users)

  const inserted = await db.insert(users).values(seedUsers).returning({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
  })

  console.log(`Inserted ${inserted.length} users:`)
  inserted.forEach((u) => console.log(`  [${u.role}] ${u.name} <${u.email}>`))

  console.log('Seeding completed.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
