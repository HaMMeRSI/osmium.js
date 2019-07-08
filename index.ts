import { Hast, OsimDocuments } from './src/compiler/compiler-interfaces';
import buildComponent from './src/compiler/template/build-component';
import * as path from 'path';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { collapseOsimDocument } from './src/compiler/template/collapse-template';
import * as parse5 from 'parse5';

const rootOsimComponent = `
<template>
	import osim2 from './components/osim2-component.js';
	import osim3 from './components/osim3-component.js';

	<osim2 name="{{name}}" day="3"></osim2>
	<osim3 name="{{name}}" day="3"></osim3>
	<osim3 name="{{someOtherName}}" day="5"></osim3>
</template>

<script>
	export default (modifires, props) => {
		modifiers['name']('sagi')
	}
</script>`;

const rootOsimDocument: OsimDocuments = parseRootDocument(rootOsimComponent, path.resolve(process.cwd(), './src'));
const collapsedHast: Hast = collapseOsimDocument(rootOsimDocument);
const newt: string = parse5.serialize(collapsedHast);
console.log(collapsedHast, '\n', newt);
const componentString = buildComponent(collapsedHast);
