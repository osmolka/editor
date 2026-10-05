import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { asyncHandler } from '../async-handler'
import { HttpError } from '../http-error'
import { currentUser } from '../middleware/current-user'
import { prisma } from '../prisma'

const ALLOWED_EXTENSIONS = new Set(['.txt', '.md'])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new HttpError(400, 'Only .txt and .md files are supported'))
      return
    }
    cb(null, true)
  },
})

function titleFromFilename(filename: string): string {
  const base = path.basename(filename, path.extname(filename))
  const cleaned = base.replace(/[-_]+/g, ' ').trim()
  return cleaned.length > 0 ? cleaned : 'Untitled Document'
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function textToHtml(text: string): string {
  const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/)
  return paragraphs
    .map((paragraph) => `<p>${paragraph.split('\n').map(escapeHtml).join('<br>')}</p>`)
    .join('')
}

export const importRouter = Router()
importRouter.use(currentUser)

// POST /api/import
importRouter.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, 'A .txt or .md file is required')
    }

    const title = titleFromFilename(req.file.originalname)
    const content = textToHtml(req.file.buffer.toString('utf-8'))

    const document = await prisma.document.create({
      data: { title, content, ownerId: req.user.id },
    })

    res.status(201).json({ document })
  }),
)
