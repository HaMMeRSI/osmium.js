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

export interface IProps {
	staticProps: IHastObjectAttributes;
	dynamicProps: IHastObjectAttributes;
}

export interface IHast {
	nodeName: string;
	attrs: IHastAttribute[];
	childNodes: IHast[];
	value?: string;
}

export interface ICollapseResult {
	hast: IHast;
	modifierScopes: IModifierScopes;
}

export interface IModifierScopes {
	global: Set<string>;
	[scope: string]: Set<string>;
}
