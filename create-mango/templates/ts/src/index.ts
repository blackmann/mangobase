import { App } from 'mangobase'
import { MongoDb } from '@mangobase/mongodb'
import { expressServer } from '@mangobase/express'
import env from '@next/env'

env.loadEnvConfig('.', process.env.NODE_ENV !== 'production')

const app = new App({
	db: new MongoDb(process.env.DATABASE_URL!),
})

const PORT = process.env.PORT || 3000

app.serve(expressServer).listen(PORT, () => {
	console.log(`App started`)
	console.log(`API base url: http://localhost:${PORT}/api/`)
	console.log(`Admin: http://localhost:${PORT}/_/`)
})
