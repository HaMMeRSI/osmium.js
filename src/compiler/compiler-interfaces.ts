export type SubDocuments = { [name: string]: IOsimDocument };

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
	subDocuments: SubDocuments;
}

export interface IModifiers {
	[attribute: string]: (newValue) => void;
}

export interface IOsimNode {
	modifiers?: IModifiers;
	dom: HTMLElement | Text | DocumentFragment;
}
