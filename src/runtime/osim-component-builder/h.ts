import { ModifierAction } from './../runtime-interfaces';
import { createModifier } from './addModifier';
import { matchModifierName } from '../consts/regexes';
import * as deepmerge from 'deepmerge';
import { IOsimNode, IModifierActions, IHastAttribute } from '../runtime-interfaces';

export default (tagName: string = 'div', attrs: IHastAttribute[] = [], childs: IOsimNode[] = []): IOsimNode => {
	let modifiers: IModifierActions = {};
	const dom = {
		setAttribute: (name, newAttrValue) => {},
		addEventListener: (eventName, newAttrValue) => {},
		appendChild: (a) => {},
		getAttribute: (a) => {},
	} as any;
	// const dom = document.createElement(tagName);
	const order = [];

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

			createModifier(modifiers, modifierName[0], modifierAction);
		} else {
			dom.setAttribute(name, value);
		}
	});

	const requestedProps = {};
	childs.forEach((child): void => {
		dom.appendChild(child.dom);
		order.splice(1, 0, ...child.order);
		modifiers = deepmerge(modifiers, child.modifiersActions);
		Object.assign(requestedProps, child.requestedProps);
	});

	return {
		dom,
		modifiersActions: modifiers,
		requestedProps,
		order,
	};
};
