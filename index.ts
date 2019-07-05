import { HastTree } from './src/compiler/compiler-interfaces';
import buildComponent from './src/compiler/template/build-component';
import * as path from 'path';
import { parseToDocument } from './src/compiler/osim-file-parser';
import { collapseOsimDocument } from './src/compiler/template/collapse-template';
import * as parse5 from 'parse5';
const mainOsim = `
<template>
	import osim2 from './osim2-component.js';
	import osim3 from './osim3-component.js';

	<osim2 name="{{name}}" day="3"></osim2>
	<osim3 name="{{name}}" day="3"></osim3>
</template>

<script>
	export default (modifires, props) => {
		modifiers['name']('sagi')
	}
</script>`;

const mainOsimDocument = parseToDocument(mainOsim, path.resolve(process.cwd(), './src'));
const collapsedHast: HastTree = collapseOsimDocument(mainOsimDocument);
const newt: string = parse5.serialize(collapsedHast);
console.log(collapsedHast, '\n', newt);
// console.log(buildComponent(mainOsimDocument.template));
