import { matchDynamicGetterName, matchDynamicGetter } from '../../runtime/consts/regexes';
import { IHast } from '../compiler-interfaces';
import { componentScopeDelimiter } from '../../common/consts';
import { IHastAttribute } from '../../common/interfaces';
import { OSIM_UID, RUNTIME_PH } from './consts';

function replaceRunTime(text) {
	return text.replace(new RegExp(RUNTIME_PH, 'g'), '"+iterationModifierName+"');
}

function parseAttrs(attrs = []): string {
	return replaceRunTime(JSON.stringify(attrs.map(({ name, value }): string[] => [name, value])));
}

function componentBuilder(node: IHast): string {
	if (node.nodeName === '#text') {
		const text = JSON.stringify(node.value);
		if (!/^"(?:\\n|\\r|\\t)+"$/g.test(text)) {
			return `t(${replaceRunTime(text)})`;
		}

		return null;
	}

	if (!node.childNodes || node.childNodes.length === 0) {
		return `h('${node.nodeName}',${parseAttrs(node.attrs)})`;
	}

	const childrens: string[] = node.childNodes.map((child): string => componentBuilder(child)).filter((child) => !!child);

	const osimUid = node.attrs && node.attrs.find((attr): boolean => attr.name === OSIM_UID);
	if (node.nodeName === 'osim') {
		const attrs = node.attrs as IHastAttribute[];
		const dynamicGettersForCondition = attrs[0].value.match(matchDynamicGetter);
		const usedModifiers = dynamicGettersForCondition ? dynamicGettersForCondition.map((x) => (x === RUNTIME_PH ? 'iterationModifierName' : `'${x}'`)).join(',') : '';

		if (attrs[0].name === 'if') {
			const nodeName = `'${node.nodeName}-${attrs[0].name}'`;
			const newIf = dynamicGettersForCondition.reduce((acc, modifier) => {
				if (modifier === RUNTIME_PH) {
					return acc.replace(RUNTIME_PH, `getModifier(iterationModifierName)`);
				}
				const modifierName = modifier.match(matchDynamicGetterName)[0];
				return acc.replace(modifier, `getModifier('{{${modifierName}}}')`);
			}, attrs[0].value);
			const evaluationFunc = `(getModifier)=>(${newIf})?[${childrens.join(',')}]:null`;
			return `b(${nodeName},[${usedModifiers}],'${osimUid.value}',${evaluationFunc})`;
		} else if (attrs[0].name === 'for') {
			const nodeName = `'${node.nodeName}-${attrs[0].name}'`;
			const modifierName = dynamicGettersForCondition[0].match(matchDynamicGetterName)[0];
			const childrensString = childrens.join(',');
			const iterationModifierName = `\`{{${modifierName}.\${i}}}\``;
			const evaluationFunc = `(getModifier)=>getModifier('{{${modifierName}}}').map((_,i)=>{const iterationModifierName=${iterationModifierName};return [${childrensString}];})`;
			return `b(${nodeName},[${usedModifiers}],'${osimUid.value}',${evaluationFunc})`;
		}

		return `b(${node.nodeName},[${dynamicGettersForCondition.join(',')}],()=>[${childrens.join(',')}])`;
	} else if (osimUid) {
		return `c('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
	} else if (node.nodeName === '#document-fragment') {
		return `[${childrens.join(',')}]`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
}

export default (hast: IHast): string => {
	return `o(${componentBuilder(hast)})`;
};
