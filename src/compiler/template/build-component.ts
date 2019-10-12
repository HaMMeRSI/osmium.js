/* eslint-disable @typescript-eslint/no-use-before-define */
import { ITextExpression, IOastBase, ILoopStatement, IConditionStatement, ICallExpression, IMemberExpression } from './../oast-interfaces';
import { IHast, IOastModifier } from '../compiler-interfaces';
import { OSIM_UID } from './consts';
import { ENUM_OAST_TYPES } from './oast-builder';
import { componentScopeDelimiter } from '../../common/consts';

enum ENUM_CONTEXT {
	Script = 'Script',
	String = 'String',
	MemberString = 'MemberString',
	MemberScript = 'MemberScript',
}

function buildRegularModifier(hastModifier: IOastModifier) {
	return `${hastModifier.scope}${componentScopeDelimiter}${hastModifier.value}`;
}

function prepareText({ parts }: ITextExpression) {
	return parts.map((part) => builder(part, ENUM_CONTEXT.String)).join('');
}

function prepareLoopStatement(node: ILoopStatement) {
	return (childrensString) => `(${node.loopValue},${node.loopKey})=>[${childrensString}]`;
}

function prepareConditionStatement(node: IConditionStatement) {
	return node.brokenCondition.map((part) => builder(part, ENUM_CONTEXT.Script)).join('');
}

function prepareMemberExpression(node: IMemberExpression, context: ENUM_CONTEXT) {
	const memberContext = context === ENUM_CONTEXT.Script ? ENUM_CONTEXT.MemberScript : ENUM_CONTEXT.MemberString;

	if (context === ENUM_CONTEXT.String) {
		return `{{${builder(node.object, memberContext)}[${builder(node.property, memberContext)}]}}`;
	}

	return `${builder(node.object, memberContext)}[${builder(node.property, memberContext)}]`;
}

function prepareCallExpression(node: ICallExpression, context: ENUM_CONTEXT) {
	if (context === ENUM_CONTEXT.String) {
		return `{{${buildRegularModifier(node.callee)}(${node.args.map((arg) => (arg.value === '$event' ? '$event' : builder(arg, ENUM_CONTEXT.String))).join(',')})}}`;
	}

	return '';
}

function builder(oast, context: ENUM_CONTEXT) {
	const factory = {
		[ENUM_OAST_TYPES.ConditionStatement]: prepareConditionStatement,
		[ENUM_OAST_TYPES.LoopStatement]: prepareLoopStatement,
		[ENUM_OAST_TYPES.MemberExpression]: prepareMemberExpression,
		[ENUM_OAST_TYPES.CallExpression]: prepareCallExpression,
		[ENUM_OAST_TYPES.TextExpression]: prepareText,
		[ENUM_OAST_TYPES.Modifier]: () => {
			switch (context) {
				case ENUM_CONTEXT.String:
					return `{{${buildRegularModifier(oast)}}}`;
				case ENUM_CONTEXT.Script:
				case ENUM_CONTEXT.MemberScript:
					return `o_gm('${buildRegularModifier(oast)}')`;
				case ENUM_CONTEXT.MemberString:
					return buildRegularModifier(oast);
				default:
					throw new Error(`Error while parsing oast, cannot find context: '${context}'`);
			}
		},
		[ENUM_OAST_TYPES.RuntimeModifier]: () => {
			switch (context) {
				case ENUM_CONTEXT.String:
					return `{{\${${oast.value}}}}`;
				case ENUM_CONTEXT.Script:
				case ENUM_CONTEXT.MemberScript:
					return `o_gm(${oast.value})`;
				case ENUM_CONTEXT.MemberString:
					return `\${${oast.value}}`;
				default:
					throw new Error(`Error while parsing oast, cannot find context: '${context}'`);
			}
		},
		[ENUM_OAST_TYPES.RuntimePrimitive]: () => {
			switch (context) {
				case ENUM_CONTEXT.Script:
				case ENUM_CONTEXT.MemberScript:
					return oast.value;
				case ENUM_CONTEXT.String:
				case ENUM_CONTEXT.MemberString:
					return `\${${oast.value}}`;
				default:
					throw new Error(`Error while parsing oast, cannot find context: '${context}'`);
			}
		},
		[ENUM_OAST_TYPES.Literal]: () => {
			switch (context) {
				case ENUM_CONTEXT.Script:
				case ENUM_CONTEXT.String:
				case ENUM_CONTEXT.MemberString:
					return oast.value;
				case ENUM_CONTEXT.MemberScript:
					return `'${oast.value}'`;
				default:
					throw new Error(`Error while parsing oast, cannot find context: '${context}'`);
			}
		},
	};

	return factory[oast.type](oast, context);
}

function prepareAttrs(node: IOastBase[]): string {
	return `[${node.map((node) => `["${node.id}", \`${builder(node, ENUM_CONTEXT.String)}\`]`)}]`;
}

function handleOsimLoop(node: IHast, childrens) {
	const osimUid = node.attrs.find((attr): boolean => attr.name === OSIM_UID);
	const loopOast: ILoopStatement = node.oast.find((node) => node.id === 'for') as ILoopStatement;
	const childrensString = childrens.join(',');
	return `o_f(\`${builder(loopOast.loopItem, ENUM_CONTEXT.String)}\`,'${osimUid.value}',${builder(loopOast, ENUM_CONTEXT.Script)(childrensString)})`;
}

function handleOsimCondition(node: IHast, childrens) {
	const osimUid = node.attrs.find((attr): boolean => attr.name === OSIM_UID);

	const conditionOast: IConditionStatement = node.oast.find((node) => node.id === 'if') as IConditionStatement;
	const newIf = builder(conditionOast, ENUM_CONTEXT.Script);
	const evaluationFunc = `()=>(${newIf})?[${childrens.join(',')}]:null`;
	const usedModifiers = Array.from(
		new Set(
			conditionOast.brokenCondition
				.filter((node) => [ENUM_OAST_TYPES.Modifier, ENUM_OAST_TYPES.RuntimeModifier, ENUM_OAST_TYPES.MemberExpression].includes(node.type))
				.map((node) => `\`${builder(node, ENUM_CONTEXT.String)}\``)
		)
	);
	return `o_i([${usedModifiers}],'${osimUid.value}',${evaluationFunc})`;
}

function componentBuilder(node: IHast): string {
	if (node.nodeName === '#text') {
		if (!/^[\r\n\t]+$/.test(node.value)) {
			const escapedText = JSON.stringify(builder(node.oast[0], ENUM_CONTEXT.String)).slice(1, -1);
			const text = `\`${escapedText}\``;
			return `o_t(${text})`;
		}

		return null;
	}

	if (!node.childNodes || node.childNodes.length === 0) {
		return `o_h('${node.nodeName}',${prepareAttrs(node.oast)})`;
	}

	const childrens: string[] = node.childNodes.map((child): string => componentBuilder(child)).filter((child) => !!child);

	if (node.nodeName === 'osim') {
		const conditionAttr = node.attrs.find((attr) => attr.name === 'if');
		if (conditionAttr) {
			return handleOsimCondition(node, childrens);
		} else {
			return handleOsimLoop(node, childrens);
		}
	}

	const osimUid = node.attrs && node.attrs.find((attr): boolean => attr.name === OSIM_UID);
	if (osimUid) {
		return `o_c('${node.nodeName}',${prepareAttrs(node.oast)},[${childrens.join(',')}])`;
	} else if (node.nodeName === '#document-fragment') {
		return `[${childrens.join(',')}]`;
	}

	return `o_h('${node.nodeName}',${prepareAttrs(node.oast)},[${childrens.join(',')}])`;
}

export default (hast: IHast): string => {
	return `o_o(${componentBuilder(hast)})`;
};
