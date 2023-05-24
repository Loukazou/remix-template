import hexRgb from "hex-rgb"
import plugin from "tailwindcss/plugin"

// ------------------------------
// Helpers
// ------------------------------
function getRgbChannels(hex: string) {
	const { red, green, blue } = hexRgb(hex)
	return `${red} ${green} ${blue}`
}

interface ColorTheme {
	[key: string]: string | ColorTheme
}

// Generate CSS variables
function getCssVariableDeclarations(
	input: string | ColorTheme,
	path: string[] = [],
	output: Record<string, string> = {},
): Record<string, string> {
	Object.entries(input).forEach(([key, value]) => {
		const newPath = path.concat(key)
		if (typeof value !== "string") {
			getCssVariableDeclarations(value, newPath, output)
		} else {
			output[`--${newPath.join("-")}`] = getRgbChannels(value)
		}
	})
	return output
}

// Generate color extension object
function getColorUtilitiesWithCssVariableReferences(
	input: string | ColorTheme,
	path: string[] = [],
): ColorTheme {
	return Object.fromEntries(
		Object.entries(input).map(([key, value]) => {
			const newPath = path.concat(key)
			if (typeof value !== "string") {
				return [
					key,
					getColorUtilitiesWithCssVariableReferences(value, newPath),
				]
			} else {
				return [key, `rgb(var(--${newPath.join("-")}) / <alpha-value>)`]
			}
		}),
	)
}

// Check for valid color themes input
function checkForValidColorThemesInput(input: ColorTheme) {
	const isValid =
		typeof input === "object" &&
		Object.keys(input).some((key) => typeof input[key] === "object")
	if (!isValid) {
		throw new Error(
			"The Multi-Theme Plugin expects a `colorThemes` option passed to it, which contains at least one theme object.",
		)
	}
}

// ------------------------------
// Plugin definition
// ------------------------------
const multiThemePlugin = plugin.withOptions(
	function (options: { colorThemes: ColorTheme }) {
		const { colorThemes } = options
		checkForValidColorThemesInput(colorThemes)
		return function ({ addBase }) {
			addBase({
				":root": getCssVariableDeclarations(Object.values(colorThemes)[0]),
			})
			Object.entries(colorThemes).forEach(([key, value]) => {
				addBase({
					[`[data-theme="${key}"]`]: getCssVariableDeclarations(value),
				})
			})
		}
	},
	function (options) {
		const { colorThemes } = options
		checkForValidColorThemesInput(colorThemes)
		return {
			theme: {
				extend: {
					colors: getColorUtilitiesWithCssVariableReferences(
						Object.values(colorThemes)[0],
					),
				},
			},
		}
	},
)

export default multiThemePlugin
