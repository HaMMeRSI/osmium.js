import { IHastModifier, IHastModifiers } from '../compiler-interfaces';
import { matchModifierName } from '../../runtime/consts/regexes';
import { IRuntimeModifiers } from './runtimeModifiers';
import { extractLoopItems, extractConditionModifiers, extractFunctionItems } from './jast';
import { extractModifierName } from './match';

export enum ENUM_MODIFIERS_TYPE {
	STATIC = 0,
	REGULAR = 100,
	REGULAR_IN_IF = 101,
	REGULAR_IN_LOOP = 102,
	RUNTIME = 200,
	RUNTIME_IN_TEXT = 201,
	RUNTIME_IN_LOOP = 202,
	RUNTIME_IN_COND = 203,
	RUNTIME_MODIFIER = 300,
	RUNTIME_MODIFIER_IN_TEXT = 301,
	CALLEE = 600,
}

export enum ENUM_NODE_TYPE {
	TEXT = 0,
	DOM = 1,
}

function resolveModifier(nodeType: ENUM_NODE_TYPE, modifierAccessorName, runtimeModifiers: IRuntimeModifiers, parentProps, componentScope): IHastModifier {
	let type = ENUM_MODIFIERS_TYPE.REGULAR;
	let scope = componentScope;
	let name = modifierAccessorName;
	const modifierName = modifierAccessorName.split('.')[0];
	const runtimeMatch = runtimeModifiers.find(modifierName);

	if (modifierName in parentProps.staticProps) {
		type = ENUM_MODIFIERS_TYPE.STATIC;
		name = parentProps.staticProps[modifierName].value;
	} else if (runtimeMatch) {
		type = runtimeMatch.type;
		if (nodeType === ENUM_NODE_TYPE.TEXT) {
			if (runtimeMatch.type === ENUM_MODIFIERS_TYPE.RUNTIME) {
				type = ENUM_MODIFIERS_TYPE.RUNTIME_IN_TEXT;
			} else if (runtimeMatch.type === ENUM_MODIFIERS_TYPE.RUNTIME_MODIFIER) {
				type = ENUM_MODIFIERS_TYPE.RUNTIME_MODIFIER_IN_TEXT;
			}
		}
	} else if (modifierName in parentProps.dynamicProps) {
		scope = parentProps.dynamicProps[modifierName].componentScope;
		name = parentProps.dynamicProps[modifierName].value;
	}

	return {
		type,
		scope,
		name,
	};
}

export function parseModifiersForText(fullModifierAccessorNames: string[], runtimeModifiers: IRuntimeModifiers, parentProps, currentComponentScope): IHastModifiers {
	return fullModifierAccessorNames.reduce((hastModifiers, fullScopedModifierAccessor) => {
		const modifierAccessorName = extractModifierName(matchModifierName, fullScopedModifierAccessor);
		hastModifiers[fullScopedModifierAccessor] = resolveModifier(ENUM_NODE_TYPE.TEXT, modifierAccessorName, runtimeModifiers, parentProps, currentComponentScope);
		return hastModifiers;
	}, {});
}

export function parseModifiersForAttr(fullModifierAccessorName: string, runtimeModifiers: IRuntimeModifiers, parentProps, currentComponentScope): IHastModifiers {
	const modifierAccessorName = extractModifierName(matchModifierName, fullModifierAccessorName);
	if (modifierAccessorName) {
		return {
			[fullModifierAccessorName]: resolveModifier(ENUM_NODE_TYPE.DOM, modifierAccessorName, runtimeModifiers, parentProps, currentComponentScope),
		};
	}

	return {};
}

export function parseModifiersForFunc(fullModifierAccessorName: string, runtimeModifiers: IRuntimeModifiers, parentProps, currentComponentScope): IHastModifiers {
	const modifierAccessorName = extractModifierName(matchModifierName, fullModifierAccessorName);
	const funcItems = extractFunctionItems(modifierAccessorName);
	const args = funcItems.args.reduce((hastModifiers, arg) => {
		hastModifiers[arg] = resolveModifier(ENUM_NODE_TYPE.TEXT, arg, runtimeModifiers, parentProps, currentComponentScope);
		return hastModifiers;
	}, {});

	if (modifierAccessorName) {
		return {
			[funcItems.callee]: {
				name: funcItems.callee,
				type: ENUM_MODIFIERS_TYPE.CALLEE,
				scope: currentComponentScope,
			},
			...args,
		};
	}

	return {};
}

export function parseModifiersForLoop(fullModifier: string, runtimeModifiers: IRuntimeModifiers, parentProps, currentComponentScope: string): IHastModifiers {
	const loopString = extractModifierName(matchModifierName, fullModifier);
	const {
		params: [loopValue, loopKey],
		loopItem,
	} = extractLoopItems(loopString);
	const runtimeLoopItem = runtimeModifiers.find(loopItem);
	return {
		loopKey: runtimeModifiers.add(loopKey, ENUM_MODIFIERS_TYPE.RUNTIME),
		loopValue: runtimeModifiers.add(loopValue, ENUM_MODIFIERS_TYPE.RUNTIME_MODIFIER),
		loopItem: {
			name: loopItem,
			type: runtimeLoopItem ? ENUM_MODIFIERS_TYPE.RUNTIME_IN_LOOP : ENUM_MODIFIERS_TYPE.REGULAR_IN_LOOP,
			scope: currentComponentScope,
		},
	};
}

export function parseModifiersForCondition(fullModifier: string, runtimeModifiers: IRuntimeModifiers, parentProps, currentComponentScope: string): IHastModifiers {
	const conditionString = extractModifierName(matchModifierName, fullModifier);
	const loopModifiers = extractConditionModifiers(conditionString);

	return loopModifiers.reduce((hastModifiers, modifierName) => {
		const runtimeModifier = runtimeModifiers.find(modifierName);
		hastModifiers[modifierName] = {
			name: modifierName,
			type: ENUM_MODIFIERS_TYPE.REGULAR_IN_IF,
			scope: currentComponentScope,
		};

		if (runtimeModifier) {
			hastModifiers[modifierName].type = ENUM_MODIFIERS_TYPE.RUNTIME_IN_COND;
		}

		return hastModifiers;
	}, {});
}
