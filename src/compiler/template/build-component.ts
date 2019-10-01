import { matchModifierName, matchRuntimeName, matchFullRuntimeName } from '../../runtime/consts/regexes';
import { IHast } from '../compiler-interfaces';
import { OSIM_UID } from './consts';
import { extractConditionModifiers } from './jast';
import { IHastAttribute } from '../../common/interfaces';
import { extractModifierName } from './match';

function escapeRuntime(text) {
	return `\`${text}\``;
}

function extractRuntime(runtime: string) {
	if (matchFullRuntimeName.test(runtime)) {
		if (runtime.startsWith('$')) {
			return runtime.match(matchRuntimeName)[0];
		} else {
			return escapeRuntime(runtime);
		}
	}

	return `'${runtime}'`;
}

function parseAttrs(attrs: IHastAttribute[] = []): string {
	return `[${attrs.map(({ name, value }) => `["${name}", ${extractRuntime(value)}]`)}]`;
}

function handleOsimCondition(node: IHast, childrens, conditionAttr: IHastAttribute) {
	const osimUid = node.attrs.find((attr): boolean => attr.name === OSIM_UID);

	const condition = extractModifierName(matchModifierName, conditionAttr.value);
	const modifierNames = extractConditionModifiers(condition.replace(matchFullRuntimeName, '"$1"'));
	const newIf = modifierNames.reduce((acc, fullModifierName) => {
		const runtimeNameMatch = fullModifierName.match(matchRuntimeName);
		let modifierName = `getModel('${fullModifierName}')`;
		if (runtimeNameMatch) {
			modifierName = runtimeNameMatch[0];
		}

		return acc.replace(fullModifierName, `${modifierName}`);
	}, condition);

	const evaluationFunc = `(getModel)=>(${newIf})?[${childrens.join(',')}]:null`;
	return `o_i([${Array.from(new Set(modifierNames)).map(extractRuntime)}],'${osimUid.value}',${evaluationFunc})`;
}

function handleOsimLoop(node: IHast, childrens) {
	const osimUid = node.attrs.find((attr): boolean => attr.name === OSIM_UID);
	const loopKey = node.attrs.find((attr) => attr.name === 'loopKey').value;
	const loopValue = node.attrs.find((attr) => attr.name === 'loopValue').value;
	const loopItem = extractRuntime(node.attrs.find((attr) => attr.name === 'loopItem').value);
	const childrensString = childrens.join(',');
	const onodeGen = `(${loopKey}, ${loopValue})=>[${childrensString}]`;
	return `o_f(${loopItem},'${osimUid.value}',${onodeGen})`;
}

function componentBuilder(node: IHast): string {
	if (node.nodeName === '#text') {
		const escapedText = JSON.stringify(node.value).slice(1, -1);
		if (!/^[\\n\\r\\t]+$/g.test(escapedText)) {
			const text = `\`${escapedText}\``;
			return `o_t(${text})`;
		}

		return null;
	}

	if (!node.childNodes || node.childNodes.length === 0) {
		return `o_h('${node.nodeName}',${parseAttrs(node.attrs)})`;
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
		return `o_c('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
	} else if (node.nodeName === '#document-fragment') {
		return `[${childrens.join(',')}]`;
	}

	return `o_h('${node.nodeName}',${parseAttrs(node.attrs)},[${childrens.join(',')}])`;
}

export default (hast: IHast): string => {
	return `o_o(${componentBuilder(hast)})`;
};
