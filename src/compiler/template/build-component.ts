import { Hast, IHastAttribute } from './../compiler-interfaces';
import { matchDynamicGetterName, matchDynamicGetter } from '../../runtime/consts/regexes';
import { componentScopeDelimiter } from '../utils/consts';

function parseAttrs(attrs = []): string {
	return JSON.stringify(attrs.map(({ name, value }): string[] => [name, value]));
}

function componentBuilder(node: Hast): string {
	if (node.nodeName === '#text') {
		const text = JSON.stringify(node.value);
		if (!/^"(?:\\n|\\r|\\t)+"$/g.test(text)) {
			return `t(${text})`;
		}

		return null;
	}

	if (!node.childNodes || node.childNodes.length === 0) {
		return `h('${node.nodeName}',${parseAttrs(node.attrs)})`;
	}

	const childrens: string[] = node.childNodes.map((child): string => componentBuilder(child)).filter((child) => !!child);

	const osimUid = node.attrs && node.attrs.find((attr): boolean => attr.name === 'osim:uid');
	if (osimUid) {
		return `c('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
	} else if (node.nodeName === '#document-fragment') {
		return `f([${childrens.join(',')}])`;
	} else if (node.nodeName === 'osim') {
		const attrs = node.attrs as IHastAttribute[];
		const dynamicGettersForCondition = attrs[0].value.match(matchDynamicGetter);

		if (attrs[0].name === 'if') {
			const newIf = dynamicGettersForCondition.reduce((acc, modifier) => {
				const splitted = modifier.match(matchDynamicGetterName)[0].split(componentScopeDelimiter);
				return acc.replace(modifier, `modifiers.${splitted[0]}.${splitted[1]}()`);
			}, attrs[0].value);

			return `b('${node.nodeName}-${attrs[0].name}',[${dynamicGettersForCondition
				.map((x) => `'${x.replace(/[{}]/g, '')}'`)
				.join(',')}],(modifiers)=>(${newIf})?f([${childrens.join(',')}]):null)`;
		}

		return `b('${node.nodeName}',[${dynamicGettersForCondition.join(',')}],()=>f([${childrens.join(',')}]))`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
}

export default (hast: Hast): string => {
	return `o(${componentBuilder(hast)})`;
};
