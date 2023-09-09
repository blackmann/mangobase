import fs from 'fs/promises'
import fsSync from 'fs'
import typedoc from 'typedoc'

const projects = ['base', 'bun-server', 'express-server', 'mongo-db']

const apiDocPaths = []

async function generateApis() {
  for (const projectDir of projects) {
    const app = await typedoc.Application.bootstrap({
      entryPoints: [`../${projectDir}/src/index.ts`],
      tsconfig: `../${projectDir}/tsconfig.json`,
      entryPointStrategy: 'expand',
    })

    console.log('[-] Parsing ' + projectDir + '...')
    const pkg = JSON.parse(
      await fs.readFile(`../${projectDir}/package.json`, { encoding: 'utf-8' })
    )

    const group = {
      collapsed: true,
      text: pkg.name,
      items: [],
    }

    try {
      await fs.mkdir(`./api/${projectDir}/`)
    } catch (err) {
      //
    }

    const project = await app.convert()
    if (project) {
      project.traverse((node) => {
        const path = `/api/${projectDir}/${node.name}`

        group.items.push({
          text: node.name,
          link: path,
        })

        fsSync.writeFileSync(`.${path}.md`, `# ${node.name}`, {encoding: 'utf-8'})
        console.log('  * ', `${node.name}.md`)
      })
    }


    group.items.sort((a, b) => a.text > b.text ? 1 : -1)
    apiDocPaths.push(group)
  }
}

generateApis().then(() => {
  console.log('[x] Completed API generation')
  fsSync.writeFileSync(
    '.vitepress/api-paths.json',
    JSON.stringify(apiDocPaths, null, 2)
  )
})
