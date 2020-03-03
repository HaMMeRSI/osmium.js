import { OsimDocuments } from '../compiler-interfaces';
import * as fs from 'fs';
import * as path from 'path';
import buildComponent from '../template/build-component';
import { reduceDocuments, IReducedDocuments } from '../template/reduce-documents';

function getOsimScriptPath(currPath) {
	return `${path.basename(currPath, path.extname(currPath))}.js`;
}

function buildOsimEntry(osimComponents: OsimDocuments, output: string): void {
	const reducedDocuments: IReducedDocuments = reduceDocuments(osimComponents);
	// const hast: IHast = collapseOsimDocument(osimComponents);
	const componenstString = Object.entries(reducedDocuments).reduce((acc, [componentName, componentMeta]) => {
		return acc.concat([[`${componentName}_`, buildComponent(componentMeta)]]);
	}, []);

	const importStrings = [];
	for (const [name, value] of Object.entries(osimComponents)) {
		// TODO: if no (../) then no (./) as well, check it?..
		importStrings.push(`import ${name} from './${getOsimScriptPath(value.path).replace(/\\/g, '/')}';`);
	}
	importStrings.push("import { o_o } from 'osim';");
	importStrings.push("import { o_cc } from 'osim';");
	importStrings.push("import { o_hh } from 'osim';");
	importStrings.push("import { o_tt } from 'osim';");
	importStrings.push("import { o_ii } from 'osim';");
	importStrings.push("import { o_ff } from 'osim';");
	importStrings.push("import { o_mm } from 'osim';");

	const entryFile = `${importStrings.join('\n')}

export default (options) => {
	const funcs = {
		${Object.values(Object.keys(osimComponents).map((name): string => name)).join(',\n\t\t')},
	};
	const modifierManager = o_mm();
	const o_gm = modifierManager.getModifier;
	const o_h = o_hh(modifierManager);
	const o_c = o_cc(modifierManager);
	const o_t = o_tt(modifierManager);
	const o_f = o_ff(funcs, modifierManager);
	const o_i = o_ii(funcs, modifierManager);
	let o_runner = 0;
	const o_id = (p) => \`\${p}\${o_runner++}\`;

	const target = document.getElementById(options.target);
	${componenstString.map(([componentName, str]) => `const ${componentName} = ${str};`).join('\n\t')}
	o_o(root_({}, 'root'), 'root')(target,funcs,modifierManager);
}`;

	fs.writeFileSync(`${output}/osim-entry.js`, entryFile);
}

function emitJsFiles(osimComponents: OsimDocuments, output: string): void {
	for (const [, value] of Object.entries(osimComponents)) {
		fs.writeFileSync(`${output}/${getOsimScriptPath(value.path)}`, value.script);
	}

	buildOsimEntry(osimComponents, output);
}

export { emitJsFiles };
