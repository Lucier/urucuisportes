import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/modules/auth/service'
import { registerSchema } from '@/modules/auth/schemas'
import { AuthError } from '@/modules/auth/types'
import { AUTH_COOKIE, COOKIE_OPTIONS } from '@/lib/auth'

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  try {
    const { token, user } = await authService.register(parsed.data)
    const response = NextResponse.json({ user }, { status: 201 })
    response.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)
    return response
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.statusCode })
    }
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
