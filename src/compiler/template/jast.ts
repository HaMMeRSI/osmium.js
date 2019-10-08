import { ILoopItems } from '../compiler-interfaces';
import * as acorn from 'acorn';
import { matchFullRuntimeName } from '../../runtime/consts/regexes';

/* eslint-disable @typescript-eslint/no-use-before-define */
function buildModifierAccessor(jast) {
	if (jast.type === 'MemberExpression') {
		return `${buildModifierAccessor(jast.object)}[${buildModifierAccessor(jast.property)}]`;
	} else if (jast.type === 'Literal') {
		return jast.raw;
	} else if (jast.type === 'Identifier') {
		return jast.name;
	}

	return jast.name;
}

export function extractLoopItems(loop: string): ILoopItems {
	function extract(loopJast): ILoopItems {
		if (loopJast.left.type === 'SequenceExpression') {
			const [loopValue, loopKey] = loopJast.left.expressions.map((exper) => exper.name);
			return {
				params: [loopValue, loopKey],
				loopItem: loopJast.right.name,
			};
		}

		return { params: [loopJast.left.name, '_'], loopItem: loopJast.right.name };
	}

	const jast: any = acorn.parse(loop);
	return extract(jast.body[0].expression);
}

export function extractConditionModifiers(condition: string): string[] {
	function extract(conditionJast) {
		if (conditionJast.type === 'ExpressionStatement') {
			return extract(conditionJast.expression);
		} else if (conditionJast.type === 'LogicalExpression') {
			return extract(conditionJast.left).concat(...extract(conditionJast.right));
		} else if (conditionJast.type === 'BinaryExpression') {
			return extract(conditionJast.left).concat(...extract(conditionJast.right));
		} else if (conditionJast.type === 'MemberExpression') {
			return [buildModifierAccessor(conditionJast)];
		} else if (conditionJast.type === 'Identifier') {
			return [conditionJast.name];
		} else if (conditionJast.type === 'Literal') {
			if (matchFullRuntimeName.test(conditionJast.value)) {
				return [conditionJast.value];
			}
		}

		return [];
	}

	const exper: any = acorn.parse(condition);
	const jast = exper.body[0];
	return extract(jast);
}

export function extractFunctionItems(func: string) {
	const exper: any = acorn.parse(func);
	const jast = exper.body[0].expression;
	return {
		callee: buildModifierAccessor(jast.callee),
		args: jast.arguments.map((arg) => buildModifierAccessor(arg)),
	};
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
