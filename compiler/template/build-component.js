const parse5 = require('parse5');

function childReduction(acc, curr) {
	acc += recurseHast(curr) + ',';
	return acc;
}

function parseAttrs(attrs = []) {
	return JSON.stringify(attrs.map(({ name, value }) => [name, value]));
}

function componntBuilder(node) {
	if (node.nodeName === '#text') {
		return `t(${JSON.stringify(node.value)})`;
	}
	if (node.nodeName === '#document-fragment') {
		return `f([${node.childNodes.reduce(childReduction, '')}])`;
	}
	if (components.includes(node.nodeName)) {
		// return c(imported)
	}
	if (!node.childNodes || node.childNodes.length === 0) {
		return `h('${node.nodeName}',${parseAttrs(node.attrs)})`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${node.childNodes.reduce(childReduction, '')}])`;
}

export default (template) => {
	return componntBuilder(parse5.parseFragment(template));
};
