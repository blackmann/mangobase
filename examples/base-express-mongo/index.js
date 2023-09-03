const { App } = require('mangobase')
const MongoDB = require('@mangobase/mongodb').default
const expressServer = require('@mangobase/express').default

const app = new App({
  db: new MongoDB('mongodb://127.0.0.1:27017/mangobase-demo'),
})

process.env.SECRET_KEY = 'test-key'
const PORT = process.env.PORT || 3000

app.serve(expressServer).listen(PORT, () => {
  console.log(`App started`)
  console.log(`API base url: http://localhost:${PORT}/api/`)
  console.log(`Admin: http://localhost:${PORT}/_/`)
})
