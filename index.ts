import * as path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';

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
const rootComponentSrcPath = path.resolve(process.cwd(), './src/ToCHEANGEtHIS');
const osimOutputPath = path.resolve(process.cwd(), './osimOutput');

const osimComponents: OsimDocuments = parseRootDocument(rootOsimComponent, rootComponentSrcPath);
emitJsFiles(osimComponents, osimOutputPath);
