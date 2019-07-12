import processTemplate from './template/process-template';
import { importFile, importedElements } from '../runtime/consts/regexes';
import * as path from 'path';
import { OsimDocuments, IOsimDocument, IOsimTemplateObject } from './compiler-interfaces';

function extractPart(part, osimFileText): string {
	part = part.toLowerCase();
	const loweredOsim = osimFileText.toLowerCase();
	const partIndex = loweredOsim.indexOf(`<${part}>`);
	if (partIndex === -1) return '';

	const start = partIndex + `<${part}>`.length;
	const end = loweredOsim.indexOf(`</${part}>`);

	return osimFileText.substring(start, end);
}

function parseToDocument(currentOsimFileText, currentFilePath, osimDocuments: OsimDocuments): IOsimDocument {
	const { imports, components, html }: IOsimTemplateObject = processTemplate(extractPart('template', currentOsimFileText));

	if (imports.length > 0) {
		for (const imported of imports) {
			const filePath: string = imported.match(importFile)[0];
			const compName: string = imported.match(importedElements)[0];

			if (!Object.values(osimDocuments).find((doc: IOsimDocument): boolean => doc.path === currentFilePath)) {
				const pathR = path.resolve(path.dirname(currentFilePath), filePath);
				const file = require(pathR);
				osimDocuments[compName] = parseToDocument(file, pathR, osimDocuments);
			}
		}
	}

	return {
		path: currentFilePath,
		html,
		components,
		script: extractPart('script', currentOsimFileText).trim(),
		style: extractPart('style', currentOsimFileText).trim(),
	};
}

function parseRootDocument(osimFileText, currentOsimFileText): OsimDocuments {
	const rootDucument: OsimDocuments = {};

	rootDucument.root = parseToDocument(osimFileText, currentOsimFileText, rootDucument);
	return rootDucument;
}

export { parseRootDocument };
