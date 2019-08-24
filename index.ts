import * as path from 'path';
import { OsimDocuments } from './src/compiler/compiler-interfaces';
import { parseRootDocument } from './src/compiler/osim-file-parser';
import { emitJsFiles } from './src/compiler/js/emit-js';
const rootOsimComponent = `
<template>
	<osim for="i in {{count}}" item="i">
		<div id="{{i}}" class="c{{i}}">
			<osim if="{{i}} === 3">
				{{i}}
			</osim>
		</div>
	</osim>
</template>

<script>
	export default (modifiers, props) => {
		modifiers.count = [1,2,3,4,5];
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
