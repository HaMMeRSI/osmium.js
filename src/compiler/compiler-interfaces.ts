import { ENUM_OAST_TYPES } from './template/oast-builder';
import { IHastAttribute } from '../common/interfaces';
import { IOastBase, IMemberExpression, ILiteral } from './oast-interfaces';

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

export interface IOastModifier {
	scope: string;
	value: string;
	type: ENUM_OAST_TYPES;
}

export interface IOastModifiers {
	[modifierName: string]: IOastModifier;
}

export interface IHast {
	nodeName: string;
	oast: IOastBase[];
	attrs: IHastAttribute[];
	childNodes: IHast[];
	value?: string;
}

export interface ILoopItems {
	params: string[];
	loopItem: IMemberExpression | ILiteral | IOastModifier;
}
