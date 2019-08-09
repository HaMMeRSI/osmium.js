import { OsimDocuments, ICollapseResult } from '../compiler-interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { collapseOsimDocument } from '../template/collapse-template';
import buildComponent from '../template/build-component';

function buildOsimEntry(osimComponents: OsimDocuments, output: string): void {
	const collapsedHast: ICollapseResult = collapseOsimDocument(osimComponents);
	const componentString = buildComponent(collapsedHast.hast);

	const importStrings = [];
	for (const [name, value] of Object.entries(osimComponents)) {
		// TODO: if no (../) then no (./) as well, check it?..
		importStrings.push(`import ${name} from '${path.relative(output, value.path).replace(/\\/g, '/')}';`);
	}
	importStrings.push("import mm from 'osmium/helpers/modifier-manager';");
	importStrings.push("import f from 'osmium/osim-component-builder/f';");
	importStrings.push("import c from 'osmium/osim-component-builder/c';");
	importStrings.push("import hh from 'osmium/osim-component-builder/h';");
	importStrings.push("import tt from 'osmium/osim-component-builder/t';");
	importStrings.push("import o from 'osmium/osim-component-builder/o';");
	importStrings.push("import b from 'osmium/osim-component-builder/b';");

	const entryFile = `${importStrings.join('\n')}

const funcs = {
	${Object.values(Object.keys(osimComponents).map((name): string => name)).join(',\n\t')}
};
const modifierManager = mm();
const h = hh(modifierManager);
const t = tt(modifierManager);

const target = document.getElementById('target');
const osim = ${componentString}(target,funcs,modifierManager);
document.getElementById('target').appendChild(osim);\n`;

	fs.writeFileSync(`${output}/osim-entry.js`, entryFile);
}

function emitJsFiles(osimComponents: OsimDocuments, output: string): void {
	for (const [, value] of Object.entries(osimComponents)) {
		fs.writeFileSync(`${output}/${path.basename(value.path)}`, value.script);
	}

	buildOsimEntry(osimComponents, output);
}

export { emitJsFiles };
