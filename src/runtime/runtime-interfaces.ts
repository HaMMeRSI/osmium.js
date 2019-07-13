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

export interface IRequestedProps {
	[componentUid: string]: IComponentProps[];
}

export interface IComponentProps {
	[Symbol.iterator]();
	attr: string;
	modifier: string;
}

export interface IOsimNode {
	order: string[];
	modifiersActions: IModifierActions;
	requestedProps: IRequestedProps;
	dom: Node;
}

export interface IHastAttribute {
	[Symbol.iterator]();
	name: string;
	value: string;
}
