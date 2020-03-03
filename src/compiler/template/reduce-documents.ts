import * as parse5 from 'parse5';
import { OsimDocuments, IHast, IOastModifier } from '../compiler-interfaces';
import { initRuntimeModifiers, IRuntimeModifiers } from './runtimeModifiers';
import { IOastBase } from '../oast-interfaces';
import { initOastBuilder, ENUM_OAST_TYPES } from './oast-builder';

export interface IComponentOastModifiers {
	[name: string]: IOastModifier;
}

export interface IComponentMeta {
	oast: IHast;
	oastModifiers: IComponentOastModifiers;
}

export interface IReducedDocuments {
	[componentName: string]: IComponentMeta;
}

export function reduceDocuments(osimComponents: OsimDocuments): IReducedDocuments {
	function resolveModifier(runtimeModifiers: IRuntimeModifiers, componentOastModifiers: IComponentOastModifiers) {
		return (modifierName: string, type?: ENUM_OAST_TYPES, isRuntime: boolean = false): IOastModifier => {
			if (!isRuntime) {
				const runtimeMatch = runtimeModifiers.find(modifierName);
				const oastModifier: IOastModifier = {
					type: ENUM_OAST_TYPES.Modifier,
					value: modifierName,
				};

				if (runtimeMatch) {
					oastModifier.type = runtimeMatch.type;
				} else if (modifierName !== '$event') {
					componentOastModifiers[modifierName] = oastModifier;
				}

				return oastModifier;
			}

			return runtimeModifiers.add(modifierName, type);
		};
	}

	function getDomNodeOast(hastNode: IHast, builder): IOastBase[] {
		return hastNode.attrs.map((attr) => {
			if (attr.name === 'for') {
				return builder.build(ENUM_OAST_TYPES.LoopStatement, attr.name, attr.value);
			} else if (attr.name === 'if') {
				return builder.build(ENUM_OAST_TYPES.ConditionStatement, attr.name, attr.value);
			} else if (attr.name.startsWith('@')) {
				return builder.build(ENUM_OAST_TYPES.CallExpression, attr.name, attr.value);
			}

			return builder.build(ENUM_OAST_TYPES.TextExpression, attr.name, attr.value);
		});
	}

	function getTextNodeOast(hastNode: IHast, builder): IOastBase[] {
		return [builder.build(ENUM_OAST_TYPES.TextExpression, 'text', hastNode.value)];
	}

	function parseHast(activeHast: IHast, usedComponents, oastBuilder): IHast {
		for (const child of activeHast.childNodes) {
			let resolveModifierFunction = getDomNodeOast;
			if (child.nodeName === '#text') {
				resolveModifierFunction = getTextNodeOast;
			} else if (child.nodeName === '#comment') {
				continue;
			}

			child.isComponent = usedComponents.includes(child.nodeName) || child.nodeName === 'osim';
			child.oast = resolveModifierFunction(child, oastBuilder);

			delete child.attrs;
			delete child.value;

			if (child.childNodes && child.childNodes.length > 0) {
				parseHast(child, usedComponents, oastBuilder);
			}
		}

		return activeHast;
	}

	return Object.entries(osimComponents).reduce((acc, [componentName, component]) => {
		const oastModifiers: IComponentOastModifiers = {};
		const oastBuilder = initOastBuilder(resolveModifier(initRuntimeModifiers(), oastModifiers));

		return Object.assign({}, acc, {
			[componentName]: {
				oast: parseHast(parse5.parseFragment(component.html), component.usedComponents, oastBuilder),
				oastModifiers,
			},
		});
	}, {});
}
