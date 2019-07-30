// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IModifierF extends ModifierAction {
	addActions: (action: ModifierAction[]) => () => void;
	addListener: (func, getProps: () => {}) => () => void;
}

export interface IModifier {
	addActions: (action: ModifierAction[]) => () => void;
	addListener: (func, getProps: () => {}) => () => void;
}

export type ComponentUid = string;

export interface IOsmiumComponentModifiers {
	[modifier: string]: IModifier;
}
export interface IModifierInstance {
	value: any;
	listeners: (() => void)[];
	actions: ModifierAction[];
}
export type IOsmiumModifiers = Map<ComponentUid, IModifierInstance>;
// export interface IOsmiumModifiers {
// 	[componentUid: string]: IOsmiumComponentModifiers;
// }
export type ModifierAction = (newValue?) => void;

export interface IModifierActions {
	[fullModifierName: string]: ModifierAction[];
}

export interface IModifierManager {
	modifiers: Map<ComponentUid, any>;
	addModifiers(modifierNames: string[]);
	addActions(modifierActions: IModifierActions);
	addListener(modifierName, func, getProps?);
	removeComponent(compinentUid: ComponentUid);
}

export type Props = (props: { [modifierName: string]: string }) => void;
export type RegisterToProps = (f: Props) => void;

export interface IComponentProps {
	[Symbol.iterator]();
	attr: string;
	modifier: string;
}
export interface IRequestedProps {
	[componentUid: string]: IComponentProps[];
}

export interface IBuiltins {
	uid: string;
	usedModifiers: string[];
	evaluationFunction: (modifiers: IOsmiumModifiers) => (modifierManager: IModifierManager) => IOsimNode;
}

export type IOsimChilds = IOsimNode[];

export interface IOsimOrder {
	uid: string;
	componentName: string;
}

export interface IOsimNode {
	dom: Node;
	modifiersActions: IModifierActions;
	requestedProps: IRequestedProps;
	builtins: IBuiltins[];
	order: IOsimOrder[];
}

export interface IHastAttribute {
	[Symbol.iterator]();
	name: string;
	value: string;
}
