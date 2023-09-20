import process from 'node:process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import makeDir from 'make-dir'
import replaceString from 'replace-string'
import _slugify from 'slugify'
import { execa } from 'execa'
import Listr from 'listr'

const slugify = _slugify as unknown as typeof _slugify.default

const candidates =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

function randomStr(length = 16) {
	return Array.from({ length })
		.map(() => candidates[Math.floor(Math.random() * candidates.length)])
		.join('')
}

const copyWithTemplate = async (
	from: string,
	to: string,
	variables: { name: string; secretKey: string }
) => {
	const dirname = path.dirname(to)
	await makeDir(dirname)

	const source = await fs.readFile(from, 'utf8')
	let generatedSource = source

	if (typeof variables === 'object') {
		generatedSource = replaceString(source, '%NAME%', variables.name)
		generatedSource = replaceString(
			generatedSource,
			'%SECRET_KEY%',
			variables.secretKey
		)
	}

	await fs.writeFile(to, generatedSource)
}

type Language = 'typescript' | 'javascript'

interface Options {
	language: Language
	projectName: string
}

async function createProject(options: Options) {
	const projectDirectoryPath = path.join(process.cwd(), options.projectName)
	const pkgName = slugify(path.basename(projectDirectoryPath))

	if (
		await fs
			.access(projectDirectoryPath)
			.then(() => true)
			.catch(() => false)
	) {
		throw new Error('Project directory already exists')
	}

	const execaInDirectory = (file: string, args: string[], options = {}) =>
		execa(file, args, {
			...options,
			cwd: projectDirectoryPath,
		})

	const typescript = options.language === 'typescript'

	const __dirname = path.dirname(fileURLToPath(import.meta.url))
	const templatePath = typescript ? 'templates/ts' : 'templates/js'

	const fromPath = (file: string) =>
		path.join(path.resolve(__dirname, templatePath), file)

	const toPath = (rootPath: string, file: string) => path.join(rootPath, file)

	const tasks = new Listr([
		{
			title: 'Copy files',
			task() {
				const variables = {
					name: pkgName,
					secretKey: randomStr(),
				}

				return new Listr([
					{
						title: 'Common files',
						async task() {
							await copyWithTemplate(
								fromPath('_package.json'),
								toPath(projectDirectoryPath, 'package.json'),
								variables
							)

							await copyWithTemplate(
								fromPath('../_common/readme.md'),
								toPath(projectDirectoryPath, 'readme.md'),
								variables
							)

							await copyWithTemplate(
								fromPath('../_common/.env'),
								toPath(projectDirectoryPath, '.env'),
								variables
							)

							await fs.copyFile(
								fromPath('../_common/_gitattributes'),
								toPath(projectDirectoryPath, '.gitattributes')
							)

							await fs.copyFile(
								fromPath('../_common/_gitignore'),
								toPath(projectDirectoryPath, '.gitignore')
							)
						},
					},
					{
						title: 'JavaScript files',
						enabled: () => !typescript,
						async task() {
							await makeDir(toPath(projectDirectoryPath, 'src'))

							await fs.copyFile(
								fromPath('src/index.mjs'),
								toPath(projectDirectoryPath, 'src/index.mjs')
							)
						},
					},
					{
						title: 'TypeScript files',
						enabled: () => typescript,
						async task() {
							await makeDir(toPath(projectDirectoryPath, 'src'))

							await fs.copyFile(
								fromPath('src/index.ts'),
								toPath(projectDirectoryPath, 'src/index.ts')
							)

							await fs.copyFile(
								fromPath('tsconfig.json'),
								toPath(projectDirectoryPath, 'tsconfig.json')
							)
						},
					},
				])
			},
		},
		{
			title: 'Install dependencies',
			async task() {
				const packages = [
					'mangobase',
					'@mangobase/express',
					'express',
					'@mangobase/mongodb',
					'mongodb',
					'@next/env',
					'jose',
				]
				await execaInDirectory('bun', ['install', ...packages])

				if (typescript) {
					await execaInDirectory('bun', [
						'install',
						'--save-dev',
						'typescript',
						'ts-node',
					])
				}
			},
		},
		{
			title: 'Format code',
			task() {
				return execaInDirectory('npx', ['prettier', '--write', '.'])
			},
		},
		{
			title: 'Initialize Git repository',
			async task() {
				await execaInDirectory('git', ['init'], {
					cwd: projectDirectoryPath,
				})

				await execaInDirectory('git', ['add', '.'], {
					cwd: projectDirectoryPath,
				})

				await execaInDirectory(
					'git',
					['commit', '-m', 'Initial commit from Mangobase'],
					{
						cwd: projectDirectoryPath,
					}
				)
			},
		},
	])

	return await tasks.run()
}

export { createProject, Options as CreateProjectOptions, Language }
