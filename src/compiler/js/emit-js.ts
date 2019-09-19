import { OsimDocuments, IHast } from '../compiler-interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { collapseOsimDocument } from '../template/collapse-template';
import buildComponent from '../template/build-component';

function getOsimScriptPath(currPath) {
	return `${path.basename(currPath, path.extname(currPath))}.js`;
}

function buildOsimEntry(osimComponents: OsimDocuments, output: string): void {
	const collapsedHast: IHast = collapseOsimDocument(osimComponents);
	const componentString = buildComponent(collapsedHast);

	const importStrings = [];
	for (const [name, value] of Object.entries(osimComponents)) {
		// TODO: if no (../) then no (./) as well, check it?..
		importStrings.push(`import ${name} from './${getOsimScriptPath(value.path).replace(/\\/g, '/')}';`);
	}
	importStrings.push("import { o } from 'osim';");
	importStrings.push("import { cc } from 'osim';");
	importStrings.push("import { hh } from 'osim';");
	importStrings.push("import { tt } from 'osim';");
	importStrings.push("import { ii } from 'osim';");
	importStrings.push("import { ff } from 'osim';");
	importStrings.push("import { mm } from 'osim';");

	const entryFile = `${importStrings.join('\n')}

export default (options) => {
	const funcs = {
		${Object.values(Object.keys(osimComponents).map((name): string => name)).join(',\n\t\t')},
	};
	const modifierManager = mm();
	const c = cc(modifierManager);
	const h = hh(modifierManager);
	const t = tt(modifierManager);
	const i = ii(funcs, modifierManager);
	const f = ff(funcs, modifierManager);

	const target = document.getElementById(options.target);
	const osim = ${componentString}(target,funcs,modifierManager);
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
