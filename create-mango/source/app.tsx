import React from 'react'
import { Text, useApp, useInput } from 'ink'
import SelectInput from 'ink-select-input'
import TextInput from 'ink-text-input'
import {
	CreateProjectOptions,
	Language,
	PackageManager,
	createProject,
} from './create-project.js'

type Props = {
	flags: {
		javascript?: boolean
	}
	destination?: string
}

const LANGUAGE_SELECT = 1
const PACKAGE_MANAGER_SELECT = 2
const DESTINATION_SELECT = 3
const CONFIRM_OPTIONS = 4
const CREATE_PROJECT = 5

const languageOptions = [
	{
		label: 'Typescript',
		value: 'typescript',
	},
	{
		label: 'Javascript',
		value: 'javascript',
	},
]

const packageManagerOptions = [
	{
		label: 'NPM',
		value: 'npm',
	},
	{
		label: 'Yarn',
		value: 'yarn',
	},
]

function Wizard() {
	const [stage, setStage] = React.useState(LANGUAGE_SELECT)
	const languageSelection = React.useRef<string>()
	const packageManagerSelection = React.useRef<string>()
	const [projectName, setProjectName] = React.useState('')

	useInput((_, key) => {
		if (stage !== CONFIRM_OPTIONS) {
			return
		}

		if (key.return) {
			setStage(CREATE_PROJECT)
		}
	})

	function handleLanguageSelect({ value }: { value: string }) {
		languageSelection.current = value
		setStage(PACKAGE_MANAGER_SELECT)
	}

	function handlePackageManagerSelect({ value }: { value: string }) {
		packageManagerSelection.current = value
		setStage(DESTINATION_SELECT)
	}

	function handleDestinationSelect() {
		if (!projectName.trim().length) {
			return
		}

		setStage(CONFIRM_OPTIONS)
	}

	if (stage === LANGUAGE_SELECT) {
		return (
			<>
				<Text>[🈷️] What language do you prefer?</Text>
				<SelectInput items={languageOptions} onSelect={handleLanguageSelect} />
			</>
		)
	}

	if (stage === PACKAGE_MANAGER_SELECT) {
		return (
			<>
				<Text>[🚌] Package Manager?</Text>
				<SelectInput
					items={packageManagerOptions}
					onSelect={handlePackageManagerSelect}
				/>
			</>
		)
	}

	if (stage === DESTINATION_SELECT) {
		return (
			<>
				<Text>[💽] Enter name of this project</Text>

				<Text color={'gray'}>
					App will be created in a folder with this name in this directory.{' '}
				</Text>
				<TextInput
					onChange={(value) => setProjectName(value)}
					value={projectName}
					onSubmit={handleDestinationSelect}
					showCursor
				/>
			</>
		)
	}

	if (stage === CONFIRM_OPTIONS) {
		return (
			<>
				<Text>[🚪] Creating project with the following options</Text>
				<Text>
					{' '}
					Language: <Text color={'gray'}>{languageSelection.current}</Text>
				</Text>
				<Text>
					{' '}
					Project name: <Text color={'gray'}>{projectName}</Text>
				</Text>
				<Text color={'gray'}>Press enter to confirm</Text>
			</>
		)
	}

	return (
		<CreateProject
			projectName={projectName}
			language={languageSelection.current as Language}
			packageManager={packageManagerSelection.current as PackageManager}
		/>
	)
}

function CreateProject(options: CreateProjectOptions) {
	const { exit } = useApp()

	React.useEffect(() => {
		createProject(options)
			.then(() => {
				console.log('')
				console.log('🌵 Done setting up project.')
				console.log('')
				console.log('Start project with `npm run dev`')
				exit()
			})
			.catch((error) => {
				console.error('')
				console.error(`❌ ${error.message}`)
				exit(error)
			})
	}, [options])

	return null
}

export default function App({ destination, flags }: Props) {
	if (flags.javascript === undefined && !destination) {
		return <Wizard />
	}

	return (
		<Text>
			Hello, <Text color="green">"Hello"</Text>
		</Text>
	)
}
