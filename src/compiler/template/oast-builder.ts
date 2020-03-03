import { IOastModifier } from '../compiler-interfaces';
import { extractModifierName } from './match';
import { matchModifierName, matchFullModifierName } from '../../runtime/consts/regexes';
import { extractLoopItems, extractFunctionItems, breakCondition, buildMemberExpression } from './jast';
import { ITextExpression, ILiteral, ILoopStatement, IConditionStatement, ICallExpression, IOastBase } from '../oast-interfaces';

export enum ENUM_OAST_TYPES {
	TextExpression,
	LoopStatement,
	ConditionStatement,
	CallExpression,
	MemberExpression,
	Modifier,
	Literal,
	RuntimeModifier,
	RuntimePrimitive,
}

export function createOastLiteral(value: string | number): ILiteral {
	return {
		type: ENUM_OAST_TYPES.Literal,
		value,
	};
}

export function initOastBuilder(resolveModifier: (modifierAccessorName: string, type?: ENUM_OAST_TYPES, isRuntime?: boolean) => IOastModifier) {
	function buildOastTextExpression(id: string, text: string): ITextExpression {
		return {
			id,
			type: ENUM_OAST_TYPES.TextExpression,
			parts: text.split(matchFullModifierName).map((part: string) => {
				const modifierAccessorName = extractModifierName(matchModifierName, part);
				if (modifierAccessorName) {
					return buildMemberExpression(modifierAccessorName, resolveModifier);
				}

				return createOastLiteral(part);
			}),
		};
	}

	function buildOastLoopStatement(id: string, loopString: string): ILoopStatement {
		const {
			params: [loopValue, loopKey],
			loopItem,
		} = extractLoopItems(loopString, resolveModifier);

		return {
			id,
			type: ENUM_OAST_TYPES.LoopStatement,
			loopKey: resolveModifier(loopKey, ENUM_OAST_TYPES.RuntimePrimitive, true).value,
			loopValue: resolveModifier(loopValue, ENUM_OAST_TYPES.RuntimeModifier, true).value,
			loopItem,
		};
	}

	function buildOastConditionStatement(id: string, conditionString: string): IConditionStatement {
		return {
			id,
			type: ENUM_OAST_TYPES.ConditionStatement,
			brokenCondition: breakCondition(conditionString, resolveModifier),
		};
	}

	function buildOastCallExpression(id: string, fullModifier: string): ICallExpression {
		const modifierAccessorName = extractModifierName(matchModifierName, fullModifier);
		const { callee, args } = extractFunctionItems(modifierAccessorName, resolveModifier);

		return {
			id,
			type: ENUM_OAST_TYPES.CallExpression,
			callee,
			args,
		};
	}

	const factory = {
		[ENUM_OAST_TYPES.TextExpression]: buildOastTextExpression,
		[ENUM_OAST_TYPES.ConditionStatement]: buildOastConditionStatement,
		[ENUM_OAST_TYPES.LoopStatement]: buildOastLoopStatement,
		[ENUM_OAST_TYPES.CallExpression]: buildOastCallExpression,
	};

	return {
		build(type: ENUM_OAST_TYPES, id: string, value: string): IOastBase {
			return factory[type](id, value);
		},
	};
}
