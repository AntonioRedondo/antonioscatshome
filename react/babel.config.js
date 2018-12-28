module.exports = {
	ignore: [ "node_modules" ],
	presets: [
		"@babel/preset-env",
		"@babel/preset-react"
	],
	plugins: [
		"@babel/plugin-transform-react-display-name",
		"@babel/plugin-proposal-class-properties"
	]
};
