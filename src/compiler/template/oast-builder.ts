import { IRuntimeModifiers } from './runtimeModifiers';
import { IOastModifier, IResolvedProps } from '../compiler-interfaces';
import { extractModifierName } from './match';
import { matchModifierName, matchFullModifierName } from '../../runtime/consts/regexes';
import { extractLoopItems, extractFunctionItems, breakCondition, buildMemberExpression } from './jast';
import { ITextExpression, ILiteral, ILoopStatement, IConditionStatement, ICallExpression, IOastBase } from '../oast-interfaces';

export enum ENUM_OAST_TYPES {
	TextExpression = 'TextExpression',
	LoopStatement = 'LoopStatement',
	ConditionStatement = 'ConditionStatement',
	CallExpression = 'CallExpression',
	MemberExpression = 'MemberExpression',
	Modifier = 'Modifier',
	Literal = 'Literal',
	RuntimeModifier = 'RuntimeModifier',
	RuntimePrimitive = 'RuntimePrimitive',
}

export function createOastLiteral(value: string | number): ILiteral {
	return {
		type: ENUM_OAST_TYPES.Literal,
		value,
	};
}

export function oastBuilder(runtimeModifiers: IRuntimeModifiers, parentProps: IResolvedProps, currentComponentScope: string) {
	function resolveModifier(modifierAccessorName: string): IOastModifier {
		const modifierName = modifierAccessorName.split('.')[0];
		const runtimeMatch = runtimeModifiers.find(modifierName);
		const oastModifier: IOastModifier = {
			type: ENUM_OAST_TYPES.Modifier,
			value: modifierAccessorName,
			scope: currentComponentScope,
		};

		if (modifierName in parentProps.staticProps) {
			oastModifier.type = ENUM_OAST_TYPES.Literal;
			oastModifier.value = parentProps.staticProps[modifierName].value;
		} else if (runtimeMatch) {
			oastModifier.type = runtimeMatch.type;
		} else if (modifierName in parentProps.dynamicProps) {
			oastModifier.scope = parentProps.dynamicProps[modifierName].componentScope;
			oastModifier.value = parentProps.dynamicProps[modifierName].value;
		}

		return oastModifier;
	}

	function buildOastTextExpression(id: string, fullModifier: string): ITextExpression {
		return {
			id,
			type: ENUM_OAST_TYPES.TextExpression,
			parts: fullModifier.split(matchFullModifierName).map((part: string) => {
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
			loopKey: runtimeModifiers.add(loopKey, currentComponentScope, ENUM_OAST_TYPES.RuntimePrimitive),
			loopValue: runtimeModifiers.add(loopValue, currentComponentScope, ENUM_OAST_TYPES.RuntimeModifier),
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
