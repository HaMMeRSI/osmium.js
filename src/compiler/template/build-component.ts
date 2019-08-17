import { matchDynamicGetterName, matchDynamicGetter } from '../../runtime/consts/regexes';
import { IHast } from '../compiler-interfaces';
import { componentScopeDelimiter } from '../../common/consts';
import { IHastAttribute } from '../../common/interfaces';

function parseAttrs(attrs = []): string {
	return JSON.stringify(attrs.map(({ name, value }): string[] => [name, value]));
}

function componentBuilder(node: IHast): string {
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
	if (node.nodeName === 'osim') {
		const attrs = node.attrs as IHastAttribute[];
		const dynamicGettersForCondition = attrs[0].value.match(matchDynamicGetter);
		const usedModifiers = dynamicGettersForCondition ? dynamicGettersForCondition.map((x) => `'${x.replace(/[{}]/g, '')}'`).join(',') : '';
		if (attrs[0].name === 'if') {
			const nodeName = `'${node.nodeName}-${attrs[0].name}'`;
			const newIf = dynamicGettersForCondition.reduce((acc, modifier) => {
				const splitted = modifier.match(matchDynamicGetterName)[0].split(componentScopeDelimiter);
				return acc.replace(modifier, `modifiers['${splitted[0]}'].${splitted[1]}`);
			}, attrs[0].value);
			const evaluationFunc = `(modifiers)=>(${newIf})?[${childrens.join(',')}]:null`;
			return `b(${nodeName},{usedModifiers:[${usedModifiers}]},'${osimUid.value}',${evaluationFunc})`;
		} else if (attrs[0].name === 'for') {
			const nodeName = `'${node.nodeName}-${attrs[0].name}'`;
			const [componentUid, loopObject] = dynamicGettersForCondition[0].match(matchDynamicGetterName)[0].split(componentScopeDelimiter);
			const childrensString = childrens.join(',');
			const evaluationFunc = `(modifiers)=>()=>modifiers['${componentUid}'].${loopObject}.map(i=>({i,onode:[${childrensString}]}))`;
			return `b(${nodeName},{usedModifiers:[${usedModifiers}],loop:'${attrs[0].value}'},'${osimUid.value}',${evaluationFunc})`;
		}

		return `b(${node.nodeName},[${dynamicGettersForCondition.join(',')}],()=>[${childrens.join(',')}])`;
	} else if (osimUid) {
		return `c('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
	} else if (node.nodeName === '#document-fragment') {
		return `f([${childrens.join(',')}])`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
}

export default (hast: IHast): string => {
	return `o(${componentBuilder(hast)})`;
};
