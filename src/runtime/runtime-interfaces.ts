export type ModifierAction = (newValue) => () => void;
export interface IComponentModifier {
	[modifier: string]: {
		listeners: (() => () => void)[];
		modifierAction: ModifierAction;
	};
}

export interface IOsimModifiers {
	[component: string]: IComponentModifier;
}

export interface IRegisterToProps {
	[componentUid: string]: IComponentProps[];
}

export interface IComponentProps {
	attr: string;
	modifier: string;
}

export interface IOsimNode {
	order: string[];
	modifiers: IOsimModifiers;
	requestedProps: IRegisterToProps;
	dom: Node;
}

export interface IHastAttribute {
	[Symbol.iterator]();
	name: string;
	value: string;
}
