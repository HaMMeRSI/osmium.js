import { Hast, IHastAttribute } from './../compiler-interfaces';
import { matchModifierName, matchModifier } from '../../runtime/consts/regexes';

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
	} else if (node.nodeName === 'osim') {
		const attrs = node.attrs as IHastAttribute[];
		const modifiers = attrs[0].value.match(matchModifier);
		if (attrs[0].name === 'if') {
			const newIf = modifiers.reduce((acc, curr) => {
				const splitted = curr.match(matchModifierName)[0].split('.');
				return acc.replace(curr, `modifiers.${splitted[0]}.${splitted[1]}()`);
			}, attrs[0].value);
			return `b('${node.nodeName}-${attrs[0].name}',[${modifiers.map((x) => `'${x.replace(/[{}]/g, '')}'`).join(',')}],(modifiers)=>(${newIf})?f([${childrens.join(
				','
			)}]):null)`;
		}
		return `b('${node.nodeName}',[${modifiers.join(',')}],()=>f([${childrens.join(',')}]))`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
}

export default (hast: Hast): string => {
	return `o(${componentBuilder(hast)})`;
};
