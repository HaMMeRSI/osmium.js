import path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
const rootOsimComponent = `
<components>
	import c1 from './components/osim3-component.om';
</components>

<template>
	<osim for="{{count}}" value="i">
		<osim if="{{i}} !== 1 && {{toShow}}">
			<div id="{{i}}" class="c{{i}}">
				{{changer}}: {{i}}
			</div>
		</osim>
	</osim>
</template>

<script>
	export default (modifiers) => {
		modifiers.toShow = true;
		setTimeout(()=>{modifiers.count = [7]}, 1000);
		setTimeout(()=>{modifiers.count.pop()}, 2500);
	}
</script>`;
const rootComponentSrcPath = path.resolve(process.cwd(), './src/root.js');
const osimOutputPath = path.resolve(process.cwd(), './osimOutput');

const osimComponents: OsimDocuments = parseRootDocument(rootOsimComponent, rootComponentSrcPath);
emitJsFiles(osimComponents, osimOutputPath);
