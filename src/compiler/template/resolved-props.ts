import { IResolvedProps, IOastModifier } from '../compiler-interfaces';

export interface IHastProp {
	type: ENUM_PROP_TYPE;
	modifier: IOastModifier;
}

export interface IHastProps {
	addDynamic(attrName: string, modifier: IOastModifier): void;
	addStatic(attrName: string, modifier: IOastModifier): void;
	get(modifierName: string): IHastProp;
	has(modifierName: string): boolean;
}

export enum ENUM_PROP_TYPE {
	Dynamic = 'Dynamic',
	Static = 'Static',
}

export function initProps(): IHastProps {
	const resolvedProps: IResolvedProps = {
		staticProps: new Map(),
		dynamicProps: new Map(),
	};

	return {
		addDynamic(attrName, modifier: IOastModifier) {
			resolvedProps.dynamicProps.set(attrName, modifier);
		},
		addStatic(attrName, modifier: IOastModifier) {
			resolvedProps.staticProps.set(attrName, modifier);
		},
		get(modifierName) {
			if (resolvedProps.dynamicProps.has(modifierName)) {
				return {
					type: ENUM_PROP_TYPE.Dynamic,
					modifier: resolvedProps.dynamicProps.get(modifierName),
				};
			} else if (resolvedProps.staticProps.has(modifierName)) {
				return {
					type: ENUM_PROP_TYPE.Static,
					modifier: resolvedProps.staticProps.get(modifierName),
				};
			}

			throw new Error(`prop ${modifierName} could not be found.`);
		},
		has(modifierName) {
			return resolvedProps.dynamicProps.has(modifierName) || resolvedProps.staticProps.has(modifierName);
		},
	};
}
