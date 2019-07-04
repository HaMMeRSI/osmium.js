import * as parse5 from 'parse5';

function childReduction(acc, curr): string {
	// eslint-disable-next-line @typescript-eslint/no-use-before-define
	acc += componentBuilder(curr) + ',';
	return acc;
}

function parseAttrs(attrs = []): string {
	return JSON.stringify(attrs.map(({ name, value }): string[] => [name, value]));
}

function componentBuilder(node): string {
	if (node.nodeName === '#text') {
		return `t(${JSON.stringify(node.value)})`;
	}
	if (node.nodeName === '#document-fragment') {
		return `f([${node.childNodes.reduce(childReduction, '')}])`;
	}
	// if (components.includes(node.nodeName)) {
	// 	// return c(imported)
	// }
	if (!node.childNodes || node.childNodes.length === 0) {
		return `h('${node.nodeName}',${parseAttrs(node.attrs)})`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${node.childNodes.reduce(childReduction, '')}])`;
}

export default (template): string => {
	return componentBuilder(parse5.parseFragment(template));
};
