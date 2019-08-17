import * as path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
/**
 <template>
	import osim7 from './components/osim7-simpleModifier.js';
	<button @click="{{toggleData}}">toggle data</button>
	persona name: {{persona.name.first}}<br/>
	<osim if="{{showAge}} === true">
		persona age: {{persona.age}}<br/>
		<osim7></osim7><br/><br/>
		<osim if="{{showData}} === true">
			data here :)
		</osim>
	</osim>
</template>
	import osim5 from './components/osim5-deepObject.js';

	<osim5 person="{{persona}}" subaba="{{data.sub.aba}}"></osim5>

 */
const rootOsimComponent = `
<template>
	<div>
		<button @click="{{toggleMainIf}}">toggle main if</button>
		<button @click="{{toggleSubIf}}">toggle sub if</button>
	</div>
	<osim if="{{showAge}} === true">
		text goes here<br/><br/>
		<osim if="{{showData}} === true">
			data here :)
		</osim>
	</osim>
</template>

<script>
	export default (modifiers, props) => {
		modifiers.toggleMainIf = () => {
			modifiers.showAge = !modifiers.showAge;
		};
		modifiers.toggleSubIf = () => {
			modifiers.showData = !modifiers.showData;
		};
		modifiers.showAge = true;
		modifiers.showData = true;
	}
</script>`;
const rootComponentSrcPath = path.resolve(process.cwd(), './src/root.js');
const osimOutputPath = path.resolve(process.cwd(), './osimOutput');

const osimComponents: OsimDocuments = parseRootDocument(rootOsimComponent, rootComponentSrcPath);
emitJsFiles(osimComponents, osimOutputPath);
