/* eslint-disable @typescript-eslint/no-use-before-define */
import { ITextExpression, IOastBase, ILoopStatement, IConditionStatement, ICallExpression, IMemberExpression } from './../oast-interfaces';
import { IHast, IOastModifier } from '../compiler-interfaces';
import { ENUM_OAST_TYPES } from './oast-builder';
import { componentScopeDelimiter } from '../../common/consts';
import { IComponentMeta } from './reduce-documents';

enum ENUM_CONTEXT {
	Script,
	String,
	MemberString,
	MemberScript,
	Callee,
	Prop,
}

function buildRegularModifier(hastModifier: IOastModifier) {
	return `\${uid}${componentScopeDelimiter}${hastModifier.value}`;
}

function prepareText({ parts }: ITextExpression, context: ENUM_CONTEXT) {
	return parts.map((part) => builder(part, context)).join('');
}

function prepareLoopStatement(node: ILoopStatement) {
	return (childrensString) => `(${node.loopValue},${node.loopKey})=>[${childrensString}]`;
}

function prepareConditionStatement(node: IConditionStatement) {
	return node.brokenCondition.map((part) => builder(part, ENUM_CONTEXT.Script)).join('');
}

function prepareMemberExpression(node: IMemberExpression, context: ENUM_CONTEXT) {
	let memberContext = ENUM_CONTEXT.MemberString;
	if (context === ENUM_CONTEXT.Script) {
		memberContext = ENUM_CONTEXT.MemberScript;
	} else if (context === ENUM_CONTEXT.Prop) {
		memberContext = ENUM_CONTEXT.Prop;
	}

	if (context === ENUM_CONTEXT.String) {
		return `{{${builder(node.object, memberContext)}[${builder(node.property, memberContext)}]}}`;
	}

	return `${builder(node.object, memberContext)}[${builder(node.property, memberContext)}]`;
}

function prepareCallExpression(node: ICallExpression, context: ENUM_CONTEXT) {
	const callee = builder(node.callee, ENUM_CONTEXT.Callee);
	const args = node.args ? `(${node.args.map((arg) => (arg.value === '$event' ? '$event' : builder(arg, ENUM_CONTEXT.String))).join(',')})` : '';

	if (context === ENUM_CONTEXT.String) {
		return `{{${callee}${args}}}`;
	} else if (context === ENUM_CONTEXT.Prop) {
		return `\`${callee}${args}\``;
	}

	return '';
}

function prepareModifier(node, context: ENUM_CONTEXT) {
	switch (context) {
		case ENUM_CONTEXT.String:
			return `{{\${o_ms['${node.value}']}}}`;
		case ENUM_CONTEXT.Prop:
		case ENUM_CONTEXT.Script:
		case ENUM_CONTEXT.MemberScript:
			return `o_gm(o_ms['${node.value}'])`;
		case ENUM_CONTEXT.Callee:
		case ENUM_CONTEXT.MemberString:
			return `\${o_ms['${node.value}']}`;
		default:
			throw new Error(`Error while parsing oast, cannot find context: '${context}'`);
	}
}

function prepareRuntimeModifier(node, context: ENUM_CONTEXT) {
	switch (context) {
		case ENUM_CONTEXT.String:
			return `{{\${${node.value}}}}`;
		case ENUM_CONTEXT.Script:
		case ENUM_CONTEXT.MemberScript:
			return `o_gm(${node.value})`;
		case ENUM_CONTEXT.MemberString:
			return `\${${node.value}}`;
		case ENUM_CONTEXT.Prop:
			return node.value;
		default:
			throw new Error(`Error while parsing oast, cannot find context: '${context}'`);
	}
}

function prepareRuntimePrimitive(node, context: ENUM_CONTEXT) {
	switch (context) {
		case ENUM_CONTEXT.Prop:
		case ENUM_CONTEXT.Script:
		case ENUM_CONTEXT.MemberScript:
			return node.value;
		case ENUM_CONTEXT.String:
		case ENUM_CONTEXT.MemberString:
			return `\${${node.value}}`;
		default:
			throw new Error(`Error while parsing oast, cannot find context: '${context}'`);
	}
}

function prepareLiteral(node, context: ENUM_CONTEXT) {
	switch (context) {
		case ENUM_CONTEXT.Script:
		case ENUM_CONTEXT.String:
		case ENUM_CONTEXT.Prop:
		case ENUM_CONTEXT.MemberString:
			return node.value;
		case ENUM_CONTEXT.MemberScript:
			return `'${node.value}'`;
		default:
			throw new Error(`Error while parsing oast, cannot find context: '${context}'`);
	}
}

function builder(oast, context: ENUM_CONTEXT) {
	const factory = {
		[ENUM_OAST_TYPES.ConditionStatement]: prepareConditionStatement,
		[ENUM_OAST_TYPES.LoopStatement]: prepareLoopStatement,
		[ENUM_OAST_TYPES.MemberExpression]: prepareMemberExpression,
		[ENUM_OAST_TYPES.CallExpression]: prepareCallExpression,
		[ENUM_OAST_TYPES.TextExpression]: prepareText,
		[ENUM_OAST_TYPES.Modifier]: prepareModifier,
		[ENUM_OAST_TYPES.RuntimeModifier]: prepareRuntimeModifier,
		[ENUM_OAST_TYPES.RuntimePrimitive]: prepareRuntimePrimitive,
		[ENUM_OAST_TYPES.Literal]: prepareLiteral,
	};

	return factory[oast.type](oast, context);
}

function prepareAttrs(node: IOastBase[]): string {
	return `[${node.map((node) => `["${node.id}", \`${builder(node, ENUM_CONTEXT.String)}\`]`)}]`;
}

function handleOsimLoop(node: IHast, childrens) {
	const loopOast: ILoopStatement = node.oast.find((node) => node.id === 'for') as ILoopStatement;
	const childrensString = childrens.join(',');
	return `o_f(\`${builder(loopOast.loopItem, ENUM_CONTEXT.String)}\`,o_id('f'),${builder(loopOast, ENUM_CONTEXT.Script)(childrensString)})`;
}

function handleOsimCondition(node: IHast, childrens) {
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
	return `o_i([${usedModifiers}],o_id('cond'),${evaluationFunc})`;
}

function prepareComponent(node: IHast) {
	const props = node.oast.reduce((acc, subNode) => {
		const propName = ['@', ':'].includes(subNode.id[0]) ? subNode.id.slice(1) : subNode.id;
		return acc.concat(`"${propName}": ${builder(subNode, ENUM_CONTEXT.Prop)},`);
	}, '');

	return `(nuid)=>${node.nodeName}_({${props}}, nuid)`;
}

export default (componentMeta: IComponentMeta): string => {
	function componentBuilder(node: IHast): string {
		if (node.nodeName === '#comment') {
			return null;
		} else if (node.nodeName === '#text') {
			if (!/^[\r\n\t]+$/.test(node.value)) {
				const escapedText = JSON.stringify(builder(node.oast[0], ENUM_CONTEXT.String)).slice(1, -1);
				return `o_t(\`${escapedText}\`)`;
			}

			return null;
		}

		const childrens: string[] = node.childNodes.map((child): string => componentBuilder(child)).filter((child) => !!child);

		if (node.nodeName === 'osim') {
			if (node.oast.find((attr) => attr.id === 'if')) {
				return handleOsimCondition(node, childrens);
			} else {
				return handleOsimLoop(node, childrens);
			}
		} else if (node.isComponent) {
			return `o_c('${node.nodeName}',o_id('${node.nodeName}'),${prepareAttrs(node.oast)},${prepareComponent(node)})`;
		} else if (node.nodeName === '#document-fragment') {
			return `[${childrens.join(',')}]`;
		} else if (!node.childNodes || node.childNodes.length === 0) {
			return `o_h('${node.nodeName}',${prepareAttrs(node.oast)})`;
		}

		return `o_h('${node.nodeName}',${prepareAttrs(node.oast)},[${childrens.join(',')}])`;
	}

	const defaultModifiers = Object.entries(componentMeta.oastModifiers).reduce((acc, [modifierName, oastModifier]) => {
		return acc.concat(`${modifierName}: \`${buildRegularModifier(oastModifier)}\`,`);
	}, '');

	const assignAction = `const o_ms = Object.assign({${defaultModifiers}}, props);`;

	return `(props, uid)=>{${assignAction} return ${componentBuilder(componentMeta.oast)}}`;
	// return `o_o(${componentBuilder(componentMeta.oast)})`;
};
