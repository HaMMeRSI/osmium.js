// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IModifier extends ModifierAction {
	addActions: (action) => () => void;
	addListner: (func, getProps: () => {}) => () => void;
}

export interface IOsmiumComponentModifiers {
	[modifier: string]: IModifier;
}

export interface IOsmiumModifiers {
	[component: string]: IOsmiumComponentModifiers;
}
export type ModifierAction = (newValue?) => void;

export interface IModifierActions {
	[fullModifierName: string]: ModifierAction[];
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
	usedModifiers: string[];
	evaluationFunction: (modifiers: IOsmiumModifiers) => IOsimNode;
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
