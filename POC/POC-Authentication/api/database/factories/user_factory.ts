import factory from '@adonisjs/lucid/factories'
import User from '#apps/users/models/user'
import { DateTime } from 'luxon'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return User.create({
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      serialNumber: faker.number.int().toString(),
      username: faker.internet.username(),
      verifiedAt: DateTime.now(),
      profilePicture: faker.image.avatarGitHub(),
      description: faker.person.bio(),
    })
  })
  .build()

export const UserFactoryWithPassord = (password: string) =>
  factory
    .define(User, async ({ faker }) => {
      return User.create({
        email: faker.internet.email().toLowerCase(),
        password: password,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        serialNumber: faker.number.int().toString(),
        username: faker.internet.username(),
        verifiedAt: DateTime.now(),
        profilePicture: faker.image.avatarGitHub(),
      })
    })
    .build()
