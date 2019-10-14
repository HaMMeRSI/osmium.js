import * as path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
const rootOsimComponent = `
<components>
	import c1 from './components/osim3-component.om';
	import c2 from './components/osim3-component.om';
</components>

<template>
	<osim for="(item, i) in items">
		<c1 todo="{{item}}" @ondelete="{{deleteItem(index)}}"></c1>
	</osim>
</template>

<script>
	export default (modifiers) => {
	}
</script>`;
const rootComponentSrcPath = path.resolve(process.cwd(), './src/root.js');
const osimOutputPath = path.resolve(process.cwd(), './osimOutput');

const osimComponents: OsimDocuments = parseRootDocument(rootOsimComponent, rootComponentSrcPath);
emitJsFiles(osimComponents, osimOutputPath);
//	import c1 from './components/osim3-component.om';
/*
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
		</osim>*/
