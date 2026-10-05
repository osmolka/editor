import path from 'node:path'
import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import multer from 'multer'
import { env } from './env'
import { HttpError } from './http-error'
import { documentsRouter } from './routes/documents'
import { importRouter } from './routes/import'

export const app = express()

app.use(cors({ origin: env.clientOrigin }))
app.use(express.json())

// Serves the built React app so client + API can deploy as one service.
// Harmless locally: this directory doesn't exist until `npm run build`,
// and Vite's own dev server (port 5173) is used for local development.
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/documents', documentsRouter)
app.use('/api/import', importRouter)

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
app.use(errorHandler)
