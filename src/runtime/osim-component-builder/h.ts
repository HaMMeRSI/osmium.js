import { ModifierAction } from './../runtime-interfaces';
import { addModifier } from './addModifier';
import { matchModifierName } from '../../consts/regexes';
import * as deepmerge from 'deepmerge';
import { IOsimNode, IModifiers, IHastAttribute } from '../runtime-interfaces';

export default (tagName: string = 'div', attrs: IHastAttribute[] = [], childs: IOsimNode[] = []): IOsimNode => {
	let modifiers: IModifiers = {};
	const dom = document.createElement(tagName);

	attrs.forEach(([name, value]: { [Symbol.iterator](); name: string; value: string }): void => {
		const modifierName = value.match(matchModifierName);

		if (modifierName) {
			let modifierAction: ModifierAction = (newAttrValue): (() => void) => (): void => {
				dom.setAttribute(name, newAttrValue);
			};

			if (name.startsWith('@')) {
				modifierAction = (newAttrValue): (() => void) => (): void => {
					const eventName = name.split('@')[1];
					// dom.removeEventListener(eventName, oldAttrValue);
					dom.addEventListener(eventName, newAttrValue);
				};
			}

			addModifier(modifiers, modifierName[0], modifierAction);
		} else {
			dom.setAttribute(name, value);
		}
	});

	childs.forEach((child): void => {
		dom.appendChild(child.dom);
		modifiers = deepmerge(modifiers, child.modifiers);
	});

	return {
		dom,
		modifiers,
		props: [],
		order: [],
	};
};
