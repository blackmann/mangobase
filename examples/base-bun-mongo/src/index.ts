import { App } from 'mangobase'
import { MongoDb } from '@mangobase/mongodb'
import { bunServer } from '@mangobase/bun'

process.env.SECRET_KEY = 'mango-bun'
const app = new App({
  db: new MongoDb('mongodb://localhost:27017/bun-mango'),
})

const PORT = 4000

app.serve(bunServer(PORT))
console.log(`App started`)
console.log(`API base url: http://localhost:${PORT}/api/`)
console.log(`Admin: http://localhost:${PORT}/_/`)
