import processTemplate from './template/process-template';
import { importFile, importedElements } from '../consts/regexes';
import * as path from 'path';
import { IOsimDocument, IOsimTemplateObject, SubDocuments } from './compiler-interfaces';

function extractPart(part, osim): string {
	part = part.toLowerCase();
	const loweredOsim = osim.toLowerCase();
	const partIndex = loweredOsim.indexOf(`<${part}>`);
	if (partIndex === -1) return '';

	const start = partIndex + `<${part}>`.length;
	const end = loweredOsim.indexOf(`</${part}>`);

	return osim.substring(start, end);
}

function parseToDocument(osimFileText, baseDir): IOsimDocument {
	const { imports, components, html }: IOsimTemplateObject = processTemplate(extractPart('template', osimFileText));
	const subComponents: SubDocuments = {};
	if (imports.length > 0) {
		imports.reduce((acc, imported): SubDocuments => {
			const filePath: string = imported.match(importFile)[0];
			const compName: string = imported.match(importedElements)[0];
			const pathR = path.resolve(baseDir, filePath);
			const file = require(pathR);
			acc[compName] = parseToDocument(file, path.dirname(pathR));

			return acc;
		}, subComponents);
	}

	return {
		html,
		components,
		script: extractPart('script', osimFileText).trim(),
		style: extractPart('style', osimFileText).trim(),
		subDocuments: subComponents,
	};
}

export { parseToDocument };
