import { App } from 'mangobase'
import MongoDb from '@mangobase/mongodb'
import bunServer from '@mangobase/bun'

process.env.SECRET_KEY = 'mango-bun'
const app = new App({
  db: new MongoDb('mongodb://localhost:27017/bun-mango')
})

app.serve(bunServer(4000))
