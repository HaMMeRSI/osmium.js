import { IMemberExpression } from './../oast-interfaces';
import { ILoopItems, IOastModifier } from '../compiler-interfaces';
import * as acorn from 'acorn';
import { ILiteral } from '../oast-interfaces';
import { ENUM_OAST_TYPES, createOastLiteral } from './oast-builder';

type IdentifierResolver = (name) => IOastModifier;

/* eslint-disable @typescript-eslint/no-use-before-define */
function buildModifierAccessor(jast, identifierResolver: IdentifierResolver): IMemberExpression | ILiteral | IOastModifier {
	function buildOastMemerExpression(innerJast, computed) {
		if (innerJast.type === 'MemberExpression') {
			return {
				type: ENUM_OAST_TYPES.MemberExpression,
				object: buildOastMemerExpression(innerJast.object, innerJast.object.type === 'Identifier'),
				property: buildOastMemerExpression(innerJast.property, innerJast.computed),
				computed: innerJast.computed,
			};
			// return `${buildOastMemerExpression(innerJast.object, identifierResolver)}[${buildOastMemerExpression(innerJast.property, identifierResolver)}]`;
		} else if (innerJast.type === 'Literal') {
			return createOastLiteral(innerJast.raw);
		}

		return computed ? identifierResolver(innerJast.name) : createOastLiteral(innerJast.name);
	}

	return buildOastMemerExpression(jast, jast.computed !== undefined ? jast.computed : true);
}

export function extractLoopItems(loop: string, identifierResolver: IdentifierResolver): ILoopItems {
	function extract(loopJast): ILoopItems {
		if (loopJast.left.type === 'SequenceExpression') {
			const [loopValue, loopKey] = loopJast.left.expressions.map((exper) => exper.name);
			return {
				params: [loopValue, loopKey],
				loopItem: buildModifierAccessor(loopJast.right, identifierResolver),
			};
		}

		return { params: [loopJast.left.name, '_'], loopItem: buildModifierAccessor(loopJast.right, identifierResolver) };
	}

	const jast: any = acorn.parse(loop);
	return extract(jast.body[0].expression);
}

export function breakCondition(condition: string, identifierResolver: IdentifierResolver): (ILiteral | IOastModifier)[] {
	function extract(conditionJast) {
		if (conditionJast.type === 'ExpressionStatement') {
			return extract(conditionJast.expression);
		} else if (conditionJast.type === 'LogicalExpression') {
			return [
				createOastLiteral('('),
				...extract(conditionJast.left),
				createOastLiteral(conditionJast.operator),
				...extract(conditionJast.right),
				createOastLiteral(')'),
			];
		} else if (conditionJast.type === 'UnaryExpression') {
			return [createOastLiteral(conditionJast.operator), ...extract(conditionJast.argument)];
		} else if (conditionJast.type === 'BinaryExpression') {
			return [...extract(conditionJast.left), createOastLiteral(conditionJast.operator), ...extract(conditionJast.right)];
		} else if (conditionJast.type === 'MemberExpression') {
			return [buildModifierAccessor(conditionJast, identifierResolver)];
		} else if (conditionJast.type === 'Identifier') {
			return [identifierResolver(conditionJast.name)];
		} else if (conditionJast.type === 'Literal') {
			return [createOastLiteral(conditionJast.value)];
		}

		return [];
	}

	const exper: any = acorn.parse(condition);
	const jast = exper.body[0];
	return extract(jast);
}

export function extractFunctionItems(func: string, identifierResolver: IdentifierResolver) {
	const program: any = acorn.parse(func);
	const exper = program.body[0].expression;
	let callee = null;
	let args = null;

	if (exper.type === 'Identifier') {
		callee = identifierResolver(exper.name);
	} else {
		callee = buildModifierAccessor(exper.callee, identifierResolver);

		if (exper.type === 'CallExpression') {
			args = exper.arguments.map((arg) => buildModifierAccessor(arg, identifierResolver));
		}
	}

	return {
		callee,
		args,
	};
}

export function buildMemberExpression(expression: string, identifierResolver: IdentifierResolver) {
	const program: any = acorn.parse(expression);
	const exper = program.body[0].expression;

	return buildModifierAccessor(exper, identifierResolver);
}

export function parseJast(resolveModifier) {
	const parseTypes = {
		Identifier: parseIdentifier,
		Literal: parseLiteral,
		ExpressionStatement: parseExpressionStatement,
		BinaryExpression: parseBinaryExpression,
		SequenceExpression: parseSequenceExpression,
		CallExpression: parseCallExpression,
		LogicalExpression: parseBinaryExpression,
		MemberExpression: parseMemberExpression,
	};

	function parseIdentifier(jast, skipResolve) {
		return skipResolve ? jast.name : resolveModifier(jast.name);
	}
	function parseLiteral(jast) {
		return jast.raw;
	}
	function parseBinaryExpression(jast) {
		const { left, operator, right } = jast;
		return `${parse(left)} ${operator} ${parse(right)}`;
	}
	function parseSequenceExpression(jast) {
		const sequence = jast.expressions.map((exper) => parse(exper, true)).join(',');
		return `(${sequence})`;
	}
	function parseMemberExpression(jast) {
		return `${parse(jast.object)}[${parse(jast.property, true)}]`;
	}
	function parseCallExpression(jast) {
		const args = jast.arguments.map((exper) => parse(exper, exper.name === '$event'));
		return `${parse(jast.callee)}:${args.join(',')}`;
	}
	function parseExpressionStatement(jast) {
		return parse(jast.expression);
	}

	function parse(jast, skipResolve = false) {
		return parseTypes[jast.type](jast, skipResolve);
	}

	return parse;
}
