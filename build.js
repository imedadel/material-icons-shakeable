const fg = require("fast-glob")
const camelcase = require("camelcase")
const svgr = require("@svgr/core").default
const fs = require("fs").promises

fg(["./material-design-icons-3.0.1/**/production/*.svg"], {
	objectMode: true,
	unique: true,
}).then(async (files) => {
	console.log(`> Found ${files.length} SVG icons.`)
	let set = new Set()
	for (const file of files) {
		console.log(`> Converting ${file.name} to JSX...`)
		const componentName = camelcase(
			file.name.replace(/(_|-)/g, "-").replace("px.svg", ""),
			{ pascalCase: true }
		)
		console.log(`> Generating ${componentName}...`)
		const svgCode = await fs.readFile(file.path, { encoding: "utf-8" })
		const jsCode = await svgr(
			svgCode,
			{
				icon: true,
				outDir: "./icons",
				plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
			},
			{ componentName }
		)
		set.add(
			`export {default as ${componentName}} from "./${componentName}.js"\n`
		)
		await fs.writeFile(`./src/${componentName}.js`, jsCode, "utf-8")
	}
	console.log("\n\n> Generating index file")
	await fs.writeFile(`./src/index.js`, [...set].join(""), "utf-8")
	console.log("\n> Done!")
})
