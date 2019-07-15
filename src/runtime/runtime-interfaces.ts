import { ModifierAction } from './runtime-interfaces';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IModifier extends ModifierAction {
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
	[component: string]: ModifierAction[];
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
	evaluationFunction: (modifiers: IOsmiumComponentModifiers) => IOsimNode;
}

export interface IOsimNode {
	dom: Node;
	modifiersActions: IModifierActions;
	requestedProps: IRequestedProps;
	builtins: IBuiltins[];
	order: string[];
}

export interface IHastAttribute {
	[Symbol.iterator]();
	name: string;
	value: string;
}
