import { addModifier } from './addModifier';
import { matchModifierName } from '../../../consts/regexes';
import { IOsimNode, IModifiers, IHastAttribute } from '../../compiler-interfaces';

export default (tagName: string = 'div', attrs: IHastAttribute[] = [], childs: IOsimNode[] = []): IOsimNode => {
	const modifiers: IModifiers = {};
	const dom = document.createElement(tagName);

	attrs.forEach(([name, value]): void => {
		const modifierName = value.match(matchModifierName);

		if (modifierName) {
			const modifierAction = (newValue): (() => void) => (): void => dom.setAttribute(name, newValue);
			addModifier(modifiers, modifierName[0], modifierAction);
		} else {
			dom.setAttribute(name, value);
		}
	});

	childs.forEach((child): Node => dom.appendChild(child.dom));

	return {
		dom,
		modifiers,
	};
};
