import { addModifier } from './addModifier';
import { matchModifierName } from '../../../consts/regexes';
import { IOsimNode, IModifiers, IHastAttribute } from '../../compiler-interfaces';
import * as deepmerge from 'deepmerge';

export default (tagName: string = 'div', attrs: IHastAttribute[] = [], childs: IOsimNode[] = []): IOsimNode => {
	let modifiers: IModifiers = {};
	// const dom = document.createElement(tagName);

	attrs.forEach(([name, value]): void => {
		const modifierName = value.match(matchModifierName);

		if (modifierName) {
			const modifierAction = (newAttrValue): (() => void) => (): void => console.log('erg'); // dom.setAttribute(name, newValue);
			addModifier(modifiers, modifierName[0], modifierAction);
		} else {
			// dom.setAttribute(name, value);
		}
	});

	childs.forEach((child): void => {
		// dom.appendChild(child.dom);
		modifiers = deepmerge(modifiers, child.modifiers);
	});

	return {
		dom: null,
		modifiers,
	};
};
