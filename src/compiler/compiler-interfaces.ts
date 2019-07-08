/* eslint-disable @typescript-eslint/no-explicit-any */
export type OsimDocuments = { [name: string]: IOsimDocument };

export interface IOsimTemplateObject {
	imports: string[];
	components: string[];
	html: string;
}

export interface IOsimDocument {
	html: string;
	components: string[];
	script: string;
	style: string;
}

export type ModifierAction = (newValue) => () => void;

export interface IModifiers {
	[component: string]: {
		[modifier: string]: ModifierAction[];
	};
}

export interface IOsimNode {
	modifiers: IModifiers;
	dom: Node;
}

export interface IHastAttribute {
	[Symbol.iterator]();
	name: string;
	value: string;
}

export interface IOsimPropModifier {
	componentScope: string;
	value: string;
}

export interface IHastObjectAttributes {
	[name: string]: IOsimPropModifier;
}

export interface ISortedParentProps {
	staticProps: IHastObjectAttributes;
	dynamicProps: IHastObjectAttributes;
}

export type Hast = any;
