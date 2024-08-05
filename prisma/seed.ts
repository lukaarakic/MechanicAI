import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import { createPassword, createUser } from 'tests/db-utils'

const prisma = new PrismaClient()

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Database has been seeded`)

  console.time('🧹 Cleaned up the database...')
  await prisma.user.deleteMany()
  await prisma.verification.deleteMany()
  console.timeEnd('🧹 Cleaned up the database...')

  const totalUsers = 5

  console.log('👤 Creating users...')
  console.time(`👤 Created ${totalUsers} users...`)

  for (let index = 0; index < totalUsers; index++) {
    const userData = createUser()
    await prisma.user.create({
      data: {
        ...userData,
        password: {
          create: createPassword(userData.email),
        },
        car: {
          create: {
            carBrand: faker.vehicle.manufacturer(),
            carModel: faker.vehicle.model(),
            engineSize: `${faker.number.int({ min: 999, max: 10000 })}cc`,
            fuel: faker.vehicle.fuel(),
            power: `${faker.number.int({ min: 10, max: 1000 })}kW`,
            shifter: 'Automatic',
            year: '2024',
          },
        },
        solution: {
          create: {
            solutionTitle: faker.lorem.text().slice(0, 20),
            solution: faker.lorem.paragraphs(),
          },
        },
      },
    })
  }
  console.timeEnd(`👤 Created ${totalUsers} users...`)

  console.timeEnd(`🌱 Database has been seeded`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
