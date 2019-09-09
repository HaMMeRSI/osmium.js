import * as path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
const rootOsimComponent = `
<template>
	<osim for="i in {{count}}" item="i">
		<osim if="{{i}} !== 1">
			<div id="{{i}}" class="c{{i}}">
				{{i}}
			</div>
		</osim>
	</osim>
</template>

<script>
	export default (modifiers, props) => {
		modifiers.count = [1,2,3,4,5];
		setTimeout(()=>{modifiers.count[4] = 4500; modifiers.count.push(45001)}, 2500)
	}
</script>`;
const rootComponentSrcPath = path.resolve(process.cwd(), './src/root.js');
const osimOutputPath = path.resolve(process.cwd(), './osimOutput');

const osimComponents: OsimDocuments = parseRootDocument(rootOsimComponent, rootComponentSrcPath);
emitJsFiles(osimComponents, osimOutputPath);
/*		<osim if="{{i}} === 3">
			{{i}}
		</osim>
*/
