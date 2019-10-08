import { matchModifierName } from '../../runtime/consts/regexes';
import { IHast, IHastModifiers, IHastModifier } from '../compiler-interfaces';
import { OSIM_UID } from './consts';
import { IHastAttribute } from '../../common/interfaces';
import { extractModifierName } from './match';
import { componentScopeDelimiter } from '../../common/consts';
import { ENUM_MODIFIERS_TYPE } from './hast-modifiers';

function buildRegularModifier(hastModifier: IHastModifier) {
	return `${hastModifier.scope}${componentScopeDelimiter}${hastModifier.name}`;
}

function prepareModifier(hastModifier: IHastModifier) {
	const parsers = {
		[ENUM_MODIFIERS_TYPE.CALLEE]: () => `${buildRegularModifier(hastModifier)}`,
		[ENUM_MODIFIERS_TYPE.REGULAR]: () => `{{${buildRegularModifier(hastModifier)}}}`,
		[ENUM_MODIFIERS_TYPE.REGULAR_IN_IF]: () => `o_gm('${buildRegularModifier(hastModifier)}')`,
		[ENUM_MODIFIERS_TYPE.REGULAR_IN_LOOP]: () => `'${buildRegularModifier(hastModifier)}'`,
		[ENUM_MODIFIERS_TYPE.RUNTIME]: () => hastModifier.name,
		[ENUM_MODIFIERS_TYPE.RUNTIME_IN_TEXT]: () => `\${${hastModifier.name}}`,
		[ENUM_MODIFIERS_TYPE.RUNTIME_IN_LOOP]: () => hastModifier.name,
		[ENUM_MODIFIERS_TYPE.RUNTIME_IN_COND]: () => `o_gm(${hastModifier.name})`,
		[ENUM_MODIFIERS_TYPE.RUNTIME_MODIFIER]: () => `o_gm(\${${hastModifier.name}})`,
		[ENUM_MODIFIERS_TYPE.RUNTIME_MODIFIER_IN_TEXT]: () => `\${o_gm(${hastModifier.name})}`,
	};

	return parsers[hastModifier.type]();
}

function prepareModifiers(hastModifiers: IHastModifiers, start) {
	return Object.entries(hastModifiers).reduce((acc, [name, metaData]) => {
		return acc.replace(name, prepareModifier(metaData));
	}, start);
}

function prepareAttrs(node: IHast): string {
	return `[${node.attrs.map(({ name, value }) => `["${name}", \`${prepareModifiers(node.modifiers, value)}\`]`)}]`;
}

function handleOsimCondition(node: IHast, childrens, conditionAttr: IHastAttribute) {
	const osimUid = node.attrs.find((attr): boolean => attr.name === OSIM_UID);

	const condition = extractModifierName(matchModifierName, conditionAttr.value);
	const newIf = prepareModifiers(node.modifiers, condition);
	const evaluationFunc = `()=>(${newIf})?[${childrens.join(',')}]:null`;
	const usedModifiers = Object.entries(node.modifiers)
		.filter(([, metaData]) => [ENUM_MODIFIERS_TYPE.REGULAR, ENUM_MODIFIERS_TYPE.REGULAR_IN_IF, ENUM_MODIFIERS_TYPE.REGULAR_IN_LOOP].includes(metaData.type))
		.map(([, metaData]) => `'${buildRegularModifier(metaData)}'`);
	return `o_i([${usedModifiers}],'${osimUid.value}',${evaluationFunc})`;
}

function handleOsimLoop(node: IHast, childrens) {
	const osimUid = node.attrs.find((attr): boolean => attr.name === OSIM_UID);
	const loopKey = node.modifiers['loopKey'].name;
	const loopValue = node.modifiers['loopValue'].name;
	const loopItem = prepareModifier(node.modifiers['loopItem']);
	const childrensString = childrens.join(',');
	const onodeGen = `(${loopValue},${loopKey})=>[${childrensString}]`;
	return `o_f(${loopItem},'${osimUid.value}',${onodeGen})`;
}

function prepareText(node: IHast): string {
	return prepareModifiers(node.modifiers, node.value);
}

function componentBuilder(node: IHast): string {
	if (node.nodeName === '#text') {
		const escapedText = JSON.stringify(prepareText(node)).slice(1, -1);
		if (!/^[\\n\\r\\t]+$/g.test(escapedText)) {
			const text = `\`${escapedText}\``;
			return `o_t(${text})`;
		}

		return null;
	}

	if (!node.childNodes || node.childNodes.length === 0) {
		return `o_h('${node.nodeName}',${prepareAttrs(node)})`;
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
		return `o_c('${node.nodeName}',${prepareAttrs(node)},[${childrens.join(',')}])`;
	} else if (node.nodeName === '#document-fragment') {
		return `[${childrens.join(',')}]`;
	}

	return `o_h('${node.nodeName}',${prepareAttrs(node)},[${childrens.join(',')}])`;
}

export default (hast: IHast): string => {
	return `o_o(${componentBuilder(hast)})`;
};
