import * as parse5 from 'parse5';
import { IOsimTemplateObject } from '../compiler-interfaces';

function parseAttrs(attrs = []): string {
	return JSON.stringify(attrs.map(({ name, value }): string[] => [name, value]));
}

function componentBuilder(node, components): string {
	if (node.nodeName === '#text') {
		return `t(${JSON.stringify(node.value)})`;
	}

	if (components.includes(node.nodeName)) {
		return `c(${node.nodeName},${parseAttrs(node.attrs)})`;
	}
	if (!node.childNodes || node.childNodes.length === 0) {
		return `h('${node.nodeName}',${parseAttrs(node.attrs)})`;
	}

	const childrens: string[] = node.childNodes.map((child): string => componentBuilder(child, components));
	if (node.nodeName === '#document-fragment') {
		return `f([${childrens.join(',')}])`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
}

export default (template: IOsimTemplateObject): string => {
	return componentBuilder(parse5.parseFragment(template.html), template.components);
};
