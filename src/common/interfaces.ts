export interface IModifierNamesByScopeObjectified {
	global: string[];
	[scope: string]: string[];
}

export interface IHastAttribute {
	name: string;
	value: string;
}

export type OsimNodeProps = string[][];
