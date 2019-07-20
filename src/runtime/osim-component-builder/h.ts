import { ModifierAction, IOsimChilds } from './../runtime-interfaces';
import { createModifier } from '../helpers/modifier-methods';
import { matchDynamicGetterName } from '../consts/regexes';
import * as deepmerge from 'deepmerge';
import { IOsimNode, IModifierActions, IHastAttribute } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';
import { resolveObjectKey, getAccessorFromString } from '../helpers/objectFunctions';

export default (tagName: string = 'div', attrs: IHastAttribute[] = [], childs: IOsimChilds = []): IOsimNode => {
	const modifiersActions: IModifierActions = {};
	const dom = document.createElement(tagName);

	attrs.forEach(([name, value]: { [Symbol.iterator](); name: string; value: string }): void => {
		const modifierName: RegExpMatchArray = value.match(matchDynamicGetterName);

		if (modifierName) {
			let modifierAction: ModifierAction = (newAttrValue): void => {
				if (typeof value === 'object') {
					dom.setAttribute(name, resolveObjectKey(getAccessorFromString(modifierName[0]), newAttrValue));
				} else {
					dom.setAttribute(name, newAttrValue);
				}
			};

			if (name.startsWith('@')) {
				modifierAction = (newAttrValue: (e) => void): void => {
					// This test is because auto activate action in enhaceModifier
					if (newAttrValue) {
						const eventName = name.split('@')[1];
						// dom.removeEventListener(eventName, oldAttrValue);
						dom.addEventListener(eventName, newAttrValue);
					}
				};
			}

			createModifier(modifiersActions, modifierName[0].split('.')[0], modifierAction);
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
		onodeh = deepmerge(onodeh, child as IOsimNode, runtimeDeepmergeOptions);
	});
	return onodeh;
};
