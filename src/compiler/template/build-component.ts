import { Hast } from './../compiler-interfaces';

function parseAttrs(attrs = []): string {
	return JSON.stringify(attrs.map(({ name, value }): string[] => [name, value]));
}

function componentBuilder(node: Hast): string {
	if (node.nodeName === '#text') {
		return `t(${JSON.stringify(node.value)})`;
	}

	if (!node.childNodes || node.childNodes.length === 0) {
		return `h('${node.nodeName}',${parseAttrs(node.attrs)})`;
	}

	const childrens: string[] = node.childNodes.map((child): string => componentBuilder(child));

	const osimUid = node.attrs && node.attrs.find((attr): boolean => attr.name === 'osim:uid');
	if (osimUid) {
		return `c('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
	} else if (node.nodeName === '#document-fragment') {
		return `f([${childrens.join(',')}])`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
}

export default (hast: Hast): string => {
	return `o(${componentBuilder(hast)})`;
};
