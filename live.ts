import * as path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
const rootOsimComponent = `
<components>
</components>

<template>
	<div id="ewf#$fwef">
		testText: {{someMod.a.b}}<br/>
		<button  @click="{{showawa($event)}}">te</button>
		<osim for="(item, i) in items">
			<osim if="wer.a === 3">
				fwe
			</osim>
			<osim for="q in items[i]">
				{{q}}
			</osim>
			name: {{item.name.a}}
			<osim if="!items[i]===3">
				wef 3
			</osim>
			<osim for="(key, j) in item">
				<button name="{{key}}" id="wefwfe" @click="{{show(key,i)}}" class={{dssd}}>{{j}}</button>
			</osim>
			<osim if="item.a === 3 || item === 2 && items === 23">
				efwe:{{item}}, {{items}}, {{i}}
			</osim>
		</osim>
	</div>
</template>

<script>
	export default (modifiers) => {
		modifiers.someMod = 'smemd';
		modifiers.items = [1,2,3];
		modifiers.show = (item) => {
			console.log(item);
		}
	}
</script>`;
const rootComponentSrcPath = path.resolve(process.cwd(), './src/root.js');
const osimOutputPath = path.resolve(process.cwd(), './osimOutput');

const osimComponents: OsimDocuments = parseRootDocument(rootOsimComponent, rootComponentSrcPath);
emitJsFiles(osimComponents, osimOutputPath);
//	import c1 from './components/osim3-component.om';
