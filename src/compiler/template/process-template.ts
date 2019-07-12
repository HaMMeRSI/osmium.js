import { importStatement, importedElements } from '../../runtime/consts/regexes';
import { IOsimTemplateObject } from '../compiler-interfaces';

export default (template): IOsimTemplateObject => {
	const imports = Array.from(template.matchAll(importStatement)).map((i): string => i[0]);
	const components = imports.join('\n').match(importedElements) || [];

	return {
		imports,
		components,
		html: template.replace(importStatement, '').trimStart(),
	};
};
