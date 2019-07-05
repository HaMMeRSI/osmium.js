import buildComponent from './src/compiler/template/build-component';
import * as path from 'path';
import { parseToDocument } from './src/compiler/osim-file-parser';
import { collapseTemplate } from './src/compiler/template/collapse-template';

const mainOsim = `
<template>
	import osim2 from './osim2-component.js';
	import osim3 from './osim3-component.js';

	<osim2 name="{{name}}" day="3"></osim2>
	<osim3 name="{{name}}" day="3"></osim3>
</template>

<script>
	export default (modifires, props) => {

	}
</script>`;

const mainOsimDocument = parseToDocument(mainOsim, path.resolve(process.cwd(), './src'));
const newt = collapseTemplate(mainOsimDocument);
// console.log(buildComponent(mainOsimDocument.template));
