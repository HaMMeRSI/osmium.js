/* eslint-disable @typescript-eslint/no-explicit-any */
export type OsimDocuments = { [name: string]: IOsimDocument };

export interface IOsimTemplateObject {
	imports: string[];
	components: string[];
	html: string;
}

export interface IOsimDocument {
	path: string;
	html: string;
	components: string[];
	script: string;
	style: string;
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
