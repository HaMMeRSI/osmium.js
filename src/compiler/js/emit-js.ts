import { OsimDocuments, IHast } from '../compiler-interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { collapseOsimDocument } from '../template/collapse-template';
import buildComponent from '../template/build-component';

function buildOsimEntry(osimComponents: OsimDocuments, output: string): void {
	const collapsedHast: IHast = collapseOsimDocument(osimComponents);
	const componentString = buildComponent(collapsedHast);

	const importStrings = [];
	for (const [name, value] of Object.entries(osimComponents)) {
		// TODO: if no (../) then no (./) as well, check it?..
		importStrings.push(`import ${name} from '${path.relative(output, value.path).replace(/\\/g, '/')}';`);
	}
	importStrings.push("import o from 'osmium/osim-component-builder/o';");
	importStrings.push("import c from 'osmium/osim-component-builder/c';");
	importStrings.push("import hh from 'osmium/osim-component-builder/h';");
	importStrings.push("import tt from 'osmium/osim-component-builder/t';");
	importStrings.push("import ii from 'osmium/osim-component-builder/i';");
	importStrings.push("import ff from 'osmium/osim-component-builder/f';");
	importStrings.push("import mm from 'osmium/helpers/modifier-manager';");

	const entryFile = `${importStrings.join('\n')}

const funcs = {
	${Object.values(Object.keys(osimComponents).map((name): string => name)).join(',\n\t')}
};
const modifierManager = mm();
const h = hh(modifierManager);
const t = tt(modifierManager);
const i = ii(funcs, modifierManager);
const f = ff(funcs, modifierManager);

const target = document.getElementById('target');
const osim = ${componentString}(target,funcs,modifierManager);`;

	fs.writeFileSync(`${output}/osim-entry.js`, entryFile);
}

function emitJsFiles(osimComponents: OsimDocuments, output: string): void {
	for (const [, value] of Object.entries(osimComponents)) {
		fs.writeFileSync(`${output}/${path.basename(value.path)}`, value.script);
	}

	buildOsimEntry(osimComponents, output);
}

export { emitJsFiles };
