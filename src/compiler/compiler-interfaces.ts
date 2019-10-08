import { IHastAttribute } from '../common/interfaces';

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

export interface IOsimPropModifier {
	componentScope?: string;
	value: string;
}

export interface IHastObjectAttributes {
	[name: string]: IOsimPropModifier;
}

export interface IResolvedProps {
	staticProps: IHastObjectAttributes;
	dynamicProps: IHastObjectAttributes;
}

export interface IHastModifier {
	scope?: string;
	name: string;
	type: number;
}

export interface IHastModifiers {
	[modifierName: string]: IHastModifier;
}

export interface IHast {
	nodeName: string;
	modifiers: IHastModifiers;
	attrs: IHastAttribute[];
	childNodes: IHast[];
	value?: string;
}

export interface ILoopItems {
	params: string[];
	loopItem: string;
}
