import { ModifierAction, IOsimChilds, IModifierManager } from './../runtime-interfaces';
import { matchDynamicGetterName } from '../consts/regexes';
import * as deepmerge from 'deepmerge';
import { IOsimNode, IHastAttribute } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';
import { resolveObjectKey, getAccessorFromString } from '../helpers/objectFunctions';

export default (modifierManager: IModifierManager) => (tagName: string = 'div', attrs: IHastAttribute[] = [], childs: IOsimChilds = []): IOsimNode => {
	const dom = document.createElement(tagName);
	const removers: (() => void)[] = [];

	attrs.forEach(([name, value]: { [Symbol.iterator](); name: string; value: string }): void => {
		const modifierName: RegExpMatchArray = value.match(matchDynamicGetterName);

		if (modifierName) {
			let action: ModifierAction = (newAttrValue): void => {
				if (typeof value === 'object') {
					dom.setAttribute(name, resolveObjectKey(getAccessorFromString(modifierName[0]), newAttrValue));
				} else {
					dom.setAttribute(name, newAttrValue);
				}
			};

			if (name.startsWith('@')) {
				action = (newAttrValue: (e) => void): void => {
					// This test is because auto activate action in enhaceModifier
					if (newAttrValue) {
						const eventName = name.split('@')[1];
						// dom.removeEventListener(eventName, oldAttrValue);
						dom.addEventListener(eventName, newAttrValue);
					}
				};
			}

			removers.push(modifierManager.addAction(modifierName[0], action));
		} else {
			dom.setAttribute(name, value);
		}
	});

	let onodeh: IOsimNode = {
		dom,
		builtins: [],
		removers,
		order: [],
		requestedProps: {},
	};

	childs.forEach((child) => {
		onodeh = deepmerge(onodeh, child as IOsimNode, runtimeDeepmergeOptions);
	});
	return onodeh;
};
