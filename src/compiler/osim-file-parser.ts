import processTemplate from './template/process-template';
import { importFile, importedElements } from '../consts/regexes';
import * as path from 'path';
import { IOsimDocument, IOsimTemplateObject, SubDocuments, IOsimRootDocument } from './compiler-interfaces';

function extractPart(part, osim): string {
	part = part.toLowerCase();
	const loweredOsim = osim.toLowerCase();
	const partIndex = loweredOsim.indexOf(`<${part}>`);
	if (partIndex === -1) return '';

	const start = partIndex + `<${part}>`.length;
	const end = loweredOsim.indexOf(`</${part}>`);

	return osim.substring(start, end);
}

function parseToDocument(osimFileText, baseDir, subDocuments): IOsimDocument {
	const { imports, components, html }: IOsimTemplateObject = processTemplate(extractPart('template', osimFileText));

	if (imports.length > 0) {
		for (const imported of imports) {
			const filePath: string = imported.match(importFile)[0];
			const compName: string = imported.match(importedElements)[0];

			if (!(compName in subDocuments)) {
				const pathR = path.resolve(baseDir, filePath);
				const file = require(pathR);
				subDocuments[compName] = parseToDocument(file, path.dirname(pathR), subDocuments);
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

function parseRootDocument(osimFileText, baseDir): IOsimRootDocument {
	const rootDucument: IOsimRootDocument = {
		subDocuments: {},
		mainDocument: null,
	};

	rootDucument.mainDocument = parseToDocument(osimFileText, baseDir, rootDucument.subDocuments);
	return rootDucument;
}

export { parseRootDocument };
