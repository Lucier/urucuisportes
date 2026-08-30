import { NextRequest, NextResponse } from 'next/server'
import { hashSync } from 'bcryptjs'
import { z } from 'zod'
import { usersRepository } from '@/modules/users/repository'
import { signToken } from '@/lib/jwt'
import { AUTH_COOKIE, COOKIE_OPTIONS } from '@/lib/auth'
import { UserRole } from '@/shared/types/auth'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const existing = await usersRepository.findByEmail(email)
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const hashedPassword = hashSync(password, 10)
  const user = await usersRepository.create({ name, email, password: hashedPassword })

  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  })

  const response = NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { status: 201 },
  )

  response.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)
  return response
}
