import * as path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
const rootOsimComponent = `
<template>
	import osim3 from './components/osim3-component.js'
	<button @click="{{toggleMainIf}}">toggle</button>
	<input @change="{{changeName}}" placeholder="name" value="{{persona.name.first}}"/>
	<osim if="{{showData}}">
		<osim3 name="{{persona.name.first}}" day="23" mimi="44"></osim3>
	</osim>
</template>

<script>
	export default (modifiers, props) => {
		modifiers.toggleMainIf = () => {
			modifiers.showData = !modifiers.showData;
		};
		modifiers.changeName = (e) => {
			modifiers.persona.name.first = e.target.value;
		};
		modifiers.showData = true;
		modifiers.persona = {
			name: {
				first: 'sagi',
				last: 'hammer',
			},
			age: 23,
		};
		modifiers.data.sub.aba = 'sababa';
	}
</script>`;
const rootComponentSrcPath = path.resolve(process.cwd(), './src/root.js');
const osimOutputPath = path.resolve(process.cwd(), './osimOutput');

const osimComponents: OsimDocuments = parseRootDocument(rootOsimComponent, rootComponentSrcPath);
emitJsFiles(osimComponents, osimOutputPath);
