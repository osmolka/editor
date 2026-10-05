import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import { prisma } from '../src/prisma'

describe('document sharing flow', () => {
  let ownerId: number
  let collaboratorId: number

  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: { email: 'owner@test.local', name: 'Test Owner' },
    })
    const collaborator = await prisma.user.create({
      data: { email: 'collaborator@test.local', name: 'Test Collaborator' },
    })
    ownerId = owner.id
    collaboratorId = collaborator.id
  })

  afterAll(async () => {
    await prisma.documentShare.deleteMany({ where: { userId: { in: [ownerId, collaboratorId] } } })
    await prisma.document.deleteMany({ where: { ownerId } })
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, collaboratorId] } } })
    await prisma.$disconnect()
  })

  it('grants a collaborator access only once the owner shares, and blocks shares from non-owners', async () => {
    const createRes = await request(app)
      .post('/api/documents')
      .set('X-User-Id', String(ownerId))
      .send({ title: 'Quarterly Report' })
    expect(createRes.status).toBe(201)
    const documentId = createRes.body.document.id as number

    // Before sharing, the collaborator has no access.
    const blockedRes = await request(app)
      .get(`/api/documents/${documentId}`)
      .set('X-User-Id', String(collaboratorId))
    expect(blockedRes.status).toBe(403)

    // Only the owner may grant access.
    const forbiddenShareRes = await request(app)
      .post(`/api/documents/${documentId}/shares`)
      .set('X-User-Id', String(collaboratorId))
      .send({ email: 'owner@test.local' })
    expect(forbiddenShareRes.status).toBe(403)

    const shareRes = await request(app)
      .post(`/api/documents/${documentId}/shares`)
      .set('X-User-Id', String(ownerId))
      .send({ email: 'collaborator@test.local' })
    expect(shareRes.status).toBe(201)

    // After sharing, the collaborator can open the document...
    const accessRes = await request(app)
      .get(`/api/documents/${documentId}`)
      .set('X-User-Id', String(collaboratorId))
    expect(accessRes.status).toBe(200)
    expect(accessRes.body.document.title).toBe('Quarterly Report')

    // ...and it shows up in their "shared with me" list.
    const sharedListRes = await request(app)
      .get('/api/documents/shared')
      .set('X-User-Id', String(collaboratorId))
    expect(sharedListRes.status).toBe(200)
    const sharedIds = sharedListRes.body.documents.map((doc: { id: number }) => doc.id)
    expect(sharedIds).toContain(documentId)
  })
})
