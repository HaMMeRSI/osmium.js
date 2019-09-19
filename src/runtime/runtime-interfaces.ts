/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IModifier {
	addActions: (action: ModifierAction[]) => () => void;
	addListener: (func) => () => void;
}

export type ComponentUid = string;

export interface IOsmiumComponentModifiers {
	[modifier: string]: IModifier;
}

export type ModifierAction = (newValue?) => void;

export interface IModifierManager {
	modifiers: Record<ComponentUid, any>;
	getModifier: (modifierName: string) => any;
	addAction(path: string, modifierActions: ModifierAction);
	addListener(modifierName, func, getProps?);
	removeComponent(compinentUid: ComponentUid);
}

export interface IComponentFuncEvents {
	update: (props: unknown) => void;
	dispose: () => void;
}
export type ComponentFuncs = {
	[name: string]: (modifiers: IOsmiumComponentModifiers) => IComponentFuncEvents;
};

export interface IOsimNode {
	dom: Node;
	removers: (() => void)[];
	addChild: (childONode: IOsimNode) => void;
	addRemover: (remover: () => void) => void;
	remove: () => void;
	removeChilds: () => void;
	compute: (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => void;
}

export type IOsimChilds = IOsimNode[];
export type EvaluationFunction = (getModifier: (modifierName: string) => any) => IOsimChilds;
