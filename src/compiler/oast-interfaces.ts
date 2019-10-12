import { ENUM_OAST_TYPES } from './template/oast-builder';
import { IOastModifier } from './compiler-interfaces';

export interface IOastBase {
	type: ENUM_OAST_TYPES;
	id?: string;
}

export interface ILiteral extends IOastBase {
	value: string | number;
}

export interface ITextExpression extends IOastBase {
	parts: (IMemberExpression | ILiteral | IOastModifier)[];
}

export interface ILoopStatement extends IOastBase {
	loopKey: string;
	loopValue: string;
	loopItem: IMemberExpression | ILiteral | IOastModifier;
}

export interface IConditionStatement extends IOastBase {
	brokenCondition: (ILiteral | IOastModifier)[];
}

export interface IMemberExpression extends IOastBase {
	object: IOastBase;
	property: IOastBase;
	computed: boolean;
}

export interface ICallExpression extends IOastBase {
	callee: IOastModifier;
	args: IOastModifier[];
}
