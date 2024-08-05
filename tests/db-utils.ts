import { faker } from '@faker-js/faker'
import { UniqueEnforcer } from 'enforce-unique'
import bcrypt from 'bcryptjs'

const uniqueEmailEnforce = new UniqueEnforcer()

export function createUser() {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const avatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${firstName}`
  const email = uniqueEmailEnforce.enforce(() => {
    return `${firstName.toLowerCase()}${lastName.toLowerCase()}@mail.com`
  })
  return {
    firstName,
    lastName,
    avatar,
    email,
    tokens: faker.number.int({ min: 10, max: 100 }),
  }
}

export function createPassword(password: string = faker.internet.password()) {
  return {
    hash: bcrypt.hashSync(password, 10),
  }
}
