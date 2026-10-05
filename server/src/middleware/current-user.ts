import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../prisma'
import { HttpError } from '../http-error'

/**
 * Mock auth: the client sends which seeded user it's acting as via a
 * header. There is no password/session — this only simulates identity.
 */
export async function currentUser(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('x-user-id')
  const userId = Number(header)

  if (!header || !Number.isInteger(userId)) {
    next(new HttpError(401, 'Missing or invalid X-User-Id header'))
    return
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    next(new HttpError(401, 'Unknown user'))
    return
  }

  req.user = user
  next()
}
