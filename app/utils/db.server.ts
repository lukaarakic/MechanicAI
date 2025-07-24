import { singleton } from './singleton.server'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

const prisma = singleton('prisma', () => {
  const config = {
    url: 'libsql://mechanicai-lukaarakic.aws-us-east-2.turso.io',
    authToken:
      'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTMyOTI5ODYsImlkIjoiNTUwOTg4OGQtYWI1Yy00NzE1LWFkY2QtMjlhYzJlZGM5NjIzIiwicmlkIjoiZWNlMTQ0ODMtNmIzZC00YTk4LThhNzktY2Q1MGM4MjMzZjRkIn0.AXjrdzxD0U6Qg4AFHmFJ6ITIs_1M07LTYsyxNFOCQZy2dRIHKl-2qTJtZdGQLkG9KU1G43nBShHdIvjlFsc6DQ',
  }

  const adapter = new PrismaLibSQL(config)
  const prisma = new PrismaClient({ adapter })

  return prisma
})

export { prisma }
