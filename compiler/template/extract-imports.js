export default function extractImports(hast) {
	if (hast.childNodes[0].nodeName !== '#text') return;

	const imports = Array.from(hast.childNodes[0].value.matchAll(/import.*?'.*?';?/g))
		.map((i) => i[0])
		.join('\n');
	const components = imports.match(/((?<=import )\w+(?= from))|(?<=({|,| ))\w+(?=(}|,| }))/gm);
	hast.childNodes.splice(0, 1);

	return {
		imports,
		components,
	};
}
