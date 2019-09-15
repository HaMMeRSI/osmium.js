import { matchDynamicGetterName, matchDynamicGetter } from '../../runtime/consts/regexes';
import { IHast } from '../compiler-interfaces';
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

		const conditionAttr = attrs.find((attr) => attr.name === 'if');
		if (conditionAttr) {
			const dynamicGettersForCondition = attrs[0].value.match(matchDynamicGetter);
			const usedModifiers = dynamicGettersForCondition
				? Array.from(new Set(dynamicGettersForCondition.map((x) => (x === RUNTIME_PH ? 'iterationModifierName' : `'${x}'`)))).join(',')
				: '';

			const newIf = dynamicGettersForCondition.reduce((acc, modifier) => {
				if (modifier === RUNTIME_PH) {
					return acc.replace(RUNTIME_PH, `getModifier(iterationModifierName)`);
				}
				const modifierName = modifier.match(matchDynamicGetterName)[0];
				return acc.replace(modifier, `getModifier('{{${modifierName}}}')`);
			}, attrs[0].value);
			const evaluationFunc = `(getModifier)=>(${newIf})?[${childrens.join(',')}]:null`;
			return `i([${usedModifiers}],'${osimUid.value}',${evaluationFunc})`;
		} else {
			const forAttr = attrs.find((attr) => attr.name === 'for');
			const modifierName = forAttr.value.match(matchDynamicGetterName)[0];
			const childrensString = childrens.join(',');
			const onodeGen = `(iterationModifierName)=>[${childrensString}]`;
			return `f(['${forAttr.value}'],'${osimUid.value}','${modifierName}',${onodeGen})`;
		}
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
