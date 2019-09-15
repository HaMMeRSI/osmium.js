import { importFile, importedElements, importStatement } from '../runtime/consts/regexes';
import * as path from 'path';
import * as fs from 'fs';
import { OsimDocuments, IOsimDocument } from './compiler-interfaces';

function processComponents(componentsPart: string) {
	const imports = componentsPart.match(importStatement) || [];
	const components = componentsPart.match(importedElements) || [];
	return {
		imports,
		components,
	};
}

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
	const html = extractPart('template', currentOsimFileText);
	const { imports, components } = processComponents(extractPart('components', currentOsimFileText));

	if (imports.length > 0) {
		for (const imported of imports) {
			const filePath: string = imported.match(importFile)[0];
			const compName: string = imported.match(importedElements)[0];

			if (!Object.values(osimDocuments).find((doc: IOsimDocument): boolean => doc.path === currentFilePath)) {
				const pathR = path.resolve(path.dirname(currentFilePath), filePath);
				const file = fs.readFileSync(pathR).toString();
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

function parseRootDocument(osimFileText, osimFilePath): OsimDocuments {
	const rootDucument: OsimDocuments = {};

	rootDucument.root = parseToDocument(osimFileText, osimFilePath, rootDucument);
	return rootDucument;
}

export { parseRootDocument };
