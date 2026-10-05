import { Router } from 'express'
import { prisma } from '../prisma'
import { HttpError } from '../http-error'
import { asyncHandler } from '../async-handler'
import { currentUser } from '../middleware/current-user'

export const documentsRouter = Router()

documentsRouter.use(currentUser)

const DOCUMENT_LIST_SELECT = {
  id: true,
  title: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
} as const

function parseDocumentId(param: string): number {
  const id = Number(param)
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Invalid document id')
  }
  return id
}

async function loadAccessibleDocument(documentId: number, userId: number) {
  const document = await prisma.document.findUnique({ where: { id: documentId } })
  if (!document) {
    throw new HttpError(404, 'Document not found')
  }
  if (document.ownerId === userId) {
    return document
  }
  const share = await prisma.documentShare.findUnique({
    where: { documentId_userId: { documentId, userId } },
  })
  if (!share) {
    throw new HttpError(403, 'You do not have access to this document')
  }
  return document
}

// GET /api/documents/owned
documentsRouter.get(
  '/owned',
  asyncHandler(async (req, res) => {
    const documents = await prisma.document.findMany({
      where: { ownerId: req.user.id },
      select: DOCUMENT_LIST_SELECT,
      orderBy: { updatedAt: 'desc' },
    })
    res.json({ documents })
  }),
)

// GET /api/documents/shared
documentsRouter.get(
  '/shared',
  asyncHandler(async (req, res) => {
    const documents = await prisma.document.findMany({
      where: { shares: { some: { userId: req.user.id } } },
      select: {
        ...DOCUMENT_LIST_SELECT,
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
    res.json({ documents })
  }),
)

// POST /api/documents
documentsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title, content } = req.body ?? {}

    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      throw new HttpError(400, 'title must be a non-empty string if provided')
    }
    if (content !== undefined && typeof content !== 'string') {
      throw new HttpError(400, 'content must be a string if provided')
    }

    const document = await prisma.document.create({
      data: {
        title: title?.trim() || 'Untitled Document',
        content: content ?? '',
        ownerId: req.user.id,
      },
    })
    res.status(201).json({ document })
  }),
)

// GET /api/documents/:id
documentsRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const documentId = parseDocumentId(req.params.id)
    const document = await loadAccessibleDocument(documentId, req.user.id)
    res.json({ document })
  }),
)

// PATCH /api/documents/:id/title
documentsRouter.patch(
  '/:id/title',
  asyncHandler(async (req, res) => {
    const documentId = parseDocumentId(req.params.id)
    await loadAccessibleDocument(documentId, req.user.id)

    const { title } = req.body ?? {}
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw new HttpError(400, 'title is required and must be a non-empty string')
    }
    if (title.length > 200) {
      throw new HttpError(400, 'title must be 200 characters or fewer')
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: { title: title.trim() },
    })
    res.json({ document })
  }),
)

// PATCH /api/documents/:id/content
documentsRouter.patch(
  '/:id/content',
  asyncHandler(async (req, res) => {
    const documentId = parseDocumentId(req.params.id)
    await loadAccessibleDocument(documentId, req.user.id)

    const { content } = req.body ?? {}
    if (typeof content !== 'string') {
      throw new HttpError(400, 'content is required and must be a string')
    }

    const document = await prisma.document.update({
      where: { id: documentId },
      data: { content },
    })
    res.json({ document })
  }),
)

// POST /api/documents/:id/shares
documentsRouter.post(
  '/:id/shares',
  asyncHandler(async (req, res) => {
    const documentId = parseDocumentId(req.params.id)
    const document = await prisma.document.findUnique({ where: { id: documentId } })
    if (!document) {
      throw new HttpError(404, 'Document not found')
    }
    if (document.ownerId !== req.user.id) {
      throw new HttpError(403, 'Only the document owner can grant access')
    }

    const { email } = req.body ?? {}
    if (typeof email !== 'string' || email.trim().length === 0) {
      throw new HttpError(400, 'email is required and must be a non-empty string')
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })
    if (!targetUser) {
      throw new HttpError(400, 'No user exists with that email')
    }
    if (targetUser.id === document.ownerId) {
      throw new HttpError(400, 'Cannot share a document with its owner')
    }

    const share = await prisma.documentShare.upsert({
      where: { documentId_userId: { documentId, userId: targetUser.id } },
      create: { documentId, userId: targetUser.id },
      update: {},
      include: { user: { select: { id: true, name: true, email: true } } },
    })

    res.status(201).json({ share })
  }),
)
