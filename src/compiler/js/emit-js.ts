import { OsimDocuments, Hast, IOsimDocument } from '../compiler-interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { collapseOsimDocument } from '../template/collapse-template';
import buildComponent from '../template/build-component';
const h = require('../template/osim-component-builder/h').default;
const c = require('../template/osim-component-builder/c').default;
const t = require('../template/osim-component-builder/t').default;
const f = require('../template/osim-component-builder/f').default;
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
	importStrings.push("import f from '../src/compiler/template/osim-component-builder/f';");
	importStrings.push("import c from '../src/compiler/template/osim-component-builder/c';");
	importStrings.push("import h from '../src/compiler/template/osim-component-builder/h';");
	importStrings.push("import t from '../src/compiler/template/osim-component-builder/t';");

	const entryFile = `${importStrings.join('\n')}

const funcs = {
	${Object.values(Object.keys(osimComponents).map((name): string => name)).join(',\n\t')}
};

const osim = ${componentString};

for (const compInOrder of osim.order) {
	const componentFunction = funcs[compInOrder.split('_')[0]];
	componentFunction(osim.modifiers[compInOrder], osim.props[compInOrder]);
}

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
