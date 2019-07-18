import { ModifierAction, IOsimBuildChilds } from './../runtime-interfaces';
import { createModifier } from '../helpers/addModifier';
import { matchModifierName } from '../consts/regexes';
import * as deepmerge from 'deepmerge';
import { IOsimNode, IModifierActions, IHastAttribute } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (tagName: string = 'div', attrs: IHastAttribute[] = [], childs: IOsimBuildChilds = []): IOsimNode => {
	const modifiersActions: IModifierActions = {};
	// const dom = {
	// 	setAttribute: (name, newAttrValue) => {},
	// 	addEventListener: (eventName, newAttrValue) => {},
	// 	appendChild: (a) => {},
	// 	getAttribute: (a) => {},
	// } as any;
	const dom = document.createElement(tagName);

	attrs.forEach(([name, value]: { [Symbol.iterator](); name: string; value: string }): void => {
		const modifierName: RegExpMatchArray = value.match(matchModifierName);

		if (modifierName) {
			let modifierAction: ModifierAction = (newAttrValue: string): void => {
				dom.setAttribute(name, newAttrValue);
			};

			if (name.startsWith('@')) {
				modifierAction = (newAttrValue: (e) => void): void => {
					const eventName = name.split('@')[1];
					// dom.removeEventListener(eventName, oldAttrValue);
					dom.addEventListener(eventName, newAttrValue);
				};
			}

			createModifier(modifiersActions, modifierName[0], modifierAction);
		} else {
			dom.setAttribute(name, value);
		}
	});

	let onodeh: IOsimNode = {
		dom,
		builtins: [],
		modifiersActions,
		order: [],
		requestedProps: {},
	};

	childs.forEach((child) => {
		let resolvedChild = child;
		if (typeof child === 'function') {
			resolvedChild = child(dom);
		}

		onodeh = deepmerge(onodeh, resolvedChild as IOsimNode, runtimeDeepmergeOptions);
	});
	return onodeh;
};
