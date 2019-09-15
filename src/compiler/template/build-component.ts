import { matchModifierName, matchFullModifierName } from '../../runtime/consts/regexes';
import { IHast } from '../compiler-interfaces';
import { OSIM_UID, RUNTIME_PH } from './consts';

function replaceRunTime(text) {
	return text.replace(new RegExp(RUNTIME_PH, 'g'), '"+iterationModifierName+"');
}

function parseAttrs(attrs = []): string {
	return replaceRunTime(JSON.stringify(attrs.map(({ name, value }): string[] => [name, value])));
}

function handleOsimCondition(node: IHast, childrens, conditionAttr) {
	const osimUid = node.attrs.find((attr): boolean => attr.name === OSIM_UID);

	const fullModifierNameForCondition = conditionAttr.value.match(matchFullModifierName);
	const usedModifiers = fullModifierNameForCondition
		? Array.from(new Set(fullModifierNameForCondition.map((x) => (x === RUNTIME_PH ? 'iterationModifierName' : `'${x.match(matchModifierName)[0]}'`)))).join(',')
		: '';

	const newIf = fullModifierNameForCondition.reduce((acc, modifier) => {
		if (modifier === RUNTIME_PH) {
			return acc.replace(RUNTIME_PH, `getModifier(iterationModifierName)`);
		}

		const modifierName = modifier.match(matchModifierName)[0];
		return acc.replace(modifier, `getModifier('${modifierName}')`);
	}, conditionAttr.value);
	const evaluationFunc = `(getModifier)=>(${newIf})?[${childrens.join(',')}]:null`;
	return `i([${usedModifiers}],'${osimUid.value}',${evaluationFunc})`;
}

function handleOsimLoop(node: IHast, childrens) {
	const osimUid = node.attrs.find((attr): boolean => attr.name === OSIM_UID);
	const forAttr = node.attrs.find((attr) => attr.name === 'for');
	const modifierName = forAttr.value.match(matchModifierName)[0];
	const childrensString = childrens.join(',');
	const onodeGen = `(iterationModifierName)=>[${childrensString}]`;
	return `f(['${modifierName}'],'${osimUid.value}','${modifierName}',${onodeGen})`;
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

	if (node.nodeName === 'osim') {
		const conditionAttr = node.attrs.find((attr) => attr.name === 'if');
		if (conditionAttr) {
			return handleOsimCondition(node, childrens, conditionAttr);
		} else {
			return handleOsimLoop(node, childrens);
		}
	}

	const osimUid = node.attrs && node.attrs.find((attr): boolean => attr.name === OSIM_UID);
	if (osimUid) {
		return `c('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
	} else if (node.nodeName === '#document-fragment') {
		return `[${childrens.join(',')}]`;
	}

	return `h('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
}

export default (hast: IHast): string => {
	return `o(${componentBuilder(hast)})`;
};
