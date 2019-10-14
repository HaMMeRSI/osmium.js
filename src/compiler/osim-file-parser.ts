import * as path from 'path';
import * as fs from 'fs';
import * as acorn from 'acorn';
import { OsimDocuments, IOsimDocument } from './compiler-interfaces';

function processComponents(componentsPart: string) {
	const importDecs: any = acorn.parse(componentsPart, {
		sourceType: 'module',
		locations: false,
	});

	return importDecs.body.map((node) => {
		if (node.type !== 'ImportDeclaration') {
			throw new Error('Only import declerations are allowed in <components>');
		}
		const defaultSpecifier = node.specifiers.find((specifier) => specifier.type === 'ImportDefaultSpecifier');

		if (!defaultSpecifier) {
			throw new Error('Only default imports are allowed in <components>');
		}

		return {
			source: node.source.value,
			componentName: defaultSpecifier.local.name,
		};
	});
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
	const components = processComponents(extractPart('components', currentOsimFileText));

	if (components.length > 0) {
		components.forEach(({ source, componentName }) => {
			if (!Object.values(osimDocuments).find((doc: IOsimDocument): boolean => doc.path === currentFilePath)) {
				const pathR = path.resolve(path.dirname(currentFilePath), source);
				const file = fs.readFileSync(pathR).toString();
				osimDocuments[componentName] = parseToDocument(file, pathR, osimDocuments);
			}
		});
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
