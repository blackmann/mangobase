import fs from 'fs/promises'
import fsSync from 'fs'
import typedoc, { Comment } from 'typedoc'

const projects = ['base', 'express-server', 'mongo-db']

const apiDocPaths = []

const SKIP_KINDS = [typedoc.ReflectionKind.TypeAlias]

async function generateApis() {
  for (const projectDir of projects) {
    const app = await typedoc.Application.bootstrap({
      entryPoints: [`../${projectDir}/src/index.ts`],
      tsconfig: `../${projectDir}/tsconfig.json`,
      excludePrivate: true,
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
        if (SKIP_KINDS.includes(node.kind)) {
          return
        }

        console.log('  * ', `${node.name}.md`)
        let path = `/api/${projectDir}/${node.name}`

        if (node.name[0] === node.name[0].toLocaleLowerCase()) {
          // doing this because some function names clashed with interface/class
          // names, causing an override of content.
          path = `/api/${projectDir}/${node.name}_function`
        }

        group.items.push({
          text: node.name,
          link: path,
        })

        fsSync.writeFileSync(`.${path}.md`, composeDoc(node, projectDir), {
          encoding: 'utf-8',
        })
      })
    }

    group.items.sort((a, b) => (a.text > b.text ? 1 : -1))

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

function composeDoc(node, packagePath) {
  const urlGenerator = (ref) => urlTo(ref, packagePath)

  const content = [
    `# ${node.name}`,
    `<Badge>${typedoc.ReflectionKind.singularString(node.kind)}</Badge>`,
  ]

  if (node.comment) {
    content.push(Comment.displayPartsToMarkdown(node.comment.summary, urlGenerator))
  }

  node.traverse((innerNode) => {
    // [ ] Show signature if any
    // [ ] Show item type (string, number, etc.)
    if (SKIP_KINDS.includes(innerNode.kind)) {
      return
    }

    const innerContent = []

    innerContent.push(`## ${innerNode.name}`)
    if (innerNode.comment) {
      innerContent.push(
        Comment.displayPartsToMarkdown(innerNode.comment.summary, urlGenerator)
      )
    }

    switch (innerNode.kind) {
      case typedoc.ReflectionKind.Method: {
        innerNode.signatures.forEach((signature) => {
          const parameters = []

          for (const p of signature.parameters) {
            parameters.push(
              `${p.name}: ${typedoc.ReflectionKind.singularString(p.kind)}`
            )
          }

          const signatureCode = `
\`\`\`typescript
public ${signature.name}(${parameters.join(', ')}): Promise<any>
\`\`\`
`
          innerContent.push(signatureCode)

          if (signature.hasComment()) {
            innerContent.push(
              Comment.displayPartsToMarkdown(signature.comment.summary, (ref) =>
                urlTo(ref, packagePath)
              )
            )
          }
        })
      }
    }

    content.push(innerContent.join('\n'))
  })

  return content.join('\n\n')
}

function urlTo(ref, base) {
  const parts = []
  parts.push(ref.name)

  let parent = ref.parent
  while (parent) {
    parts.push(parent.name)
    parent = parent.parent
  }

  parts.reverse()
  parts.shift()

  return `/api/${base}/` + parts.join('#')
}
