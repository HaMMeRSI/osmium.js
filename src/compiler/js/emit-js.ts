import { OsimDocuments, Hast } from '../compiler-interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { collapseOsimDocument } from '../template/collapse-template';
import buildComponent from '../template/build-component';
const h = require('../../runtime/osim-component-builder/h').default;
const c = require('../../runtime/osim-component-builder/c').default;
const t = require('../../runtime/osim-component-builder/t').default;
const f = require('../../runtime/osim-component-builder/f').default;
const o = require('../../runtime/osim-component-builder/o').default;
function buildOsimEntry(osimComponents: OsimDocuments, output: string): void {
	const collapsedHast: Hast = collapseOsimDocument(osimComponents);
	const componentString = buildComponent(collapsedHast.hast);
	const aaa = eval(componentString);
	console.log(aaa);

	const importStrings = [];
	for (const [name, value] of Object.entries(osimComponents)) {
		// TODO: if no (../) then no (./) as well, check it?..
		importStrings.push(`import ${name} from '${path.relative(output, value.path).replace(/\\/g, '/')}';`);
	}
	importStrings.push("import f from 'osmium/osim-component-builder/f';");
	importStrings.push("import c from 'osmium/osim-component-builder/c';");
	importStrings.push("import h from 'osmium/osim-component-builder/h';");
	importStrings.push("import t from 'osmium/osim-component-builder/t';");
	importStrings.push("import o from 'osmium/osim-component-builder/o';");

	const entryFile = `${importStrings.join('\n')}

const funcs = {
	${Object.values(Object.keys(osimComponents).map((name): string => name)).join(',\n\t')}
};

const osim = ${componentString}(funcs);
document.getElementById('target').appendChild(osim.dom);\n`;

	fs.writeFileSync(`${output}/osim-entry.js`, entryFile);
}

function emitJsFiles(osimComponents: OsimDocuments, output: string): void {
	for (const [name, value] of Object.entries(osimComponents)) {
		fs.writeFileSync(`${output}/${name}.js`, value.script);
	}

	buildOsimEntry(osimComponents, output);
}

export { emitJsFiles };
