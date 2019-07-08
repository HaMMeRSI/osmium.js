export type ModifierAction = (newValue) => () => void;

export interface IModifiers {
	[component: string]: {
		[modifier: string]: ModifierAction[];
	};
}

export interface IOsimNode {
	order: string[];
	modifiers: IModifiers;
	dom: Node;
}

export interface IHastAttribute {
	[Symbol.iterator]();
	name: string;
	value: string;
}
