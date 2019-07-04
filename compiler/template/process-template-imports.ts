export interface ITemplateObject {
	imports: string;
	components: string[];
	html: string;
}

export default function extractImports(template): ITemplateObject {
	const imports = Array.from(template.matchAll(/import.*?'.*';?/gm))
		.map((i): string => i[0])
		.join('\n');
	const components = imports.match(/((?<=import )\w+(?= from))|(?<=({|,| ))\w+(?=(}|,| }))/gm);

	return {
		imports,
		components,
		html: template.replace(/import.*?'.*';?/gm, '').trimStart(),
	};
}
