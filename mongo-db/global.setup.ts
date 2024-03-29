import { MongoMemoryServer } from 'mongodb-memory-server-core'

let mongod: MongoMemoryServer

export async function setup() {
  console.log('Starting up mongo server')
  mongod = await MongoMemoryServer.create()
  process.env.MONGO_URL = mongod.getUri('test')

  console.log('MONGO_URL', process.env.MONGO_URL)
}

export async function teardown() {
  mongod?.stop()
}
