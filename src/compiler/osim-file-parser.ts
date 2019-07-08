import processTemplate from './template/process-template';
import { importFile, importedElements } from '../consts/regexes';
import * as path from 'path';
import { IOsimDocument, IOsimTemplateObject, OsimDocuments } from './compiler-interfaces';

function extractPart(part, osimFileText): string {
	part = part.toLowerCase();
	const loweredOsim = osimFileText.toLowerCase();
	const partIndex = loweredOsim.indexOf(`<${part}>`);
	if (partIndex === -1) return '';

	const start = partIndex + `<${part}>`.length;
	const end = loweredOsim.indexOf(`</${part}>`);

	return osimFileText.substring(start, end);
}

function parseToDocument(osimFileText, baseDir, osimDocuments: OsimDocuments): IOsimDocument {
	const { imports, components, html }: IOsimTemplateObject = processTemplate(extractPart('template', osimFileText));

	if (imports.length > 0) {
		for (const imported of imports) {
			const filePath: string = imported.match(importFile)[0];
			const compName: string = imported.match(importedElements)[0];

			if (!(compName in osimDocuments)) {
				const pathR = path.resolve(baseDir, filePath);
				const file = require(pathR);
				osimDocuments[compName] = parseToDocument(file, path.dirname(pathR), osimDocuments);
			}
		}
	}

	return {
		html,
		components,
		script: extractPart('script', osimFileText).trim(),
		style: extractPart('style', osimFileText).trim(),
	};
}

function parseRootDocument(osimFileText, baseDir): OsimDocuments {
	const rootDucument: OsimDocuments = {};

	rootDucument.mainDocument = parseToDocument(osimFileText, baseDir, rootDucument);
	return rootDucument;
}

export { parseRootDocument };
