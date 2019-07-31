import * as path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
/**
 <template>
	import osim2 from './components/osim2-component.js';
	import osim3 from './components/osim3-component.js';
	import osim4 from './components/osim4-component.js';
	import osim5 from './components/osim5-component.js';

	<osim5 person="{{persona}}"></osim5>
	<osim4 batata="{{name}}" name="{{name}}"></osim4>
	<osim2 name="{{name}}" sub-domain="{{minarc}}" day="3"></osim2>
	<osim3 name="{{name}}" day="3"></osim3>
	<osim3 name="{{otherName}}" day="5"></osim3>
</template>
 */
const rootOsimComponent = `
<template>
	import osim8 from './components/osim8-loop.js';

	<osim8></osim8>
</template>

<script>
	export default (modifiers, props) => {
		/*modifiers['persona'] = {
			name: 'nahum',
			age: 23,
		};
		modifiers['name'] = 'sagi';
		setTimeout(() => {
			modifiers['name'] = 'sagi234';
		}, 2500)
		modifiers['minarc'] = 'sagiFWE';
		modifiers['otherName'] = 'Nastus';*/
	}
</script>`;
const rootComponentSrcPath = path.resolve(process.cwd(), './src/root.js');
const osimOutputPath = path.resolve(process.cwd(), './osimOutput');

const osimComponents: OsimDocuments = parseRootDocument(rootOsimComponent, rootComponentSrcPath);
emitJsFiles(osimComponents, osimOutputPath);
