import { NextRequest, NextResponse } from 'next/server'
import { compareSync } from 'bcryptjs'
import { z } from 'zod'
import { usersRepository } from '@/modules/users/repository'
import { signToken } from '@/lib/jwt'
import { AUTH_COOKIE, COOKIE_OPTIONS } from '@/lib/auth'
import { UserRole } from '@/shared/types/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await usersRepository.findByEmail(email)
  if (!user || !compareSync(password, user.password)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
  })

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })

  response.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)
  return response
}
