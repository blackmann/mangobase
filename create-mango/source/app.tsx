import React from 'react'
import { Text } from 'ink'
import SelectInput from 'ink-select-input'
import TextInput from 'ink-text-input'

type Props = {
	flags: {
		javascript?: boolean
	}
	destination?: string
}

const LANGUAGE_SELECT = 1
const DESTINATION_SELECT = 2
const CONFIRM_OPTIONS = 3

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

function Wizard() {
	const [stage, setStage] = React.useState(LANGUAGE_SELECT)
	const languageSelection = React.useRef<string>()
	const [destination, setDestination] = React.useState('')

	function handleLanguageSelect({ value }: { value: string }) {
		languageSelection.current = value
		setStage(DESTINATION_SELECT)
	}

	function handleDestinationSelect() {
		if (!destination.trim().length) {
			return
		}

		setStage(CONFIRM_OPTIONS)
	}

	if (stage === LANGUAGE_SELECT) {
		return (
			<>
				<Text>🈷️ What language do you prefer?</Text>
				<SelectInput items={languageOptions} onSelect={handleLanguageSelect} />
			</>
		)
	}

	if (stage === DESTINATION_SELECT) {
		return (
			<>
				<Text>🗂️ Enter name of this project</Text>
				<Text color={'gray'}>
					App will be created in a folder with this name in this directory.
				</Text>
				<TextInput
					onChange={(value) => setDestination(value)}
					value={destination}
					onSubmit={handleDestinationSelect}
					showCursor
				/>
			</>
		)
	}

	return (
		<>
			<Text>🪛 Creating project with the following options</Text>
			<Text> Language: <Text color={'gray'}>{languageSelection.current}</Text></Text>
			<Text> Destination: <Text color={'gray'}>{destination}</Text></Text>
		</>
	)
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
