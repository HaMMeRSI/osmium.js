import { IOsimNode } from '../../compiler-interfaces';
import { matchModifier, matchModifierName } from '../../../consts/regexes';
import { addModifier } from './addModifier';

export default (text: string): IOsimNode => {
	const dom: Text = document.createTextNode(text);
	const textModifiers = text.match(matchModifier);
	const modifiers = {};

	if (textModifiers) {
		dom.nodeValue = '';
		const splitedText = text.split(matchModifier);
		const brokenText: string[] = textModifiers.flatMap((modifierName, i): string[] => [splitedText[i], modifierName]);

		for (let i = 0; i < brokenText.length; i++) {
			const modifierName = brokenText[i].match(matchModifierName);

			if (modifierName) {
				const modifierAction = (value: string): (() => void) => {
					brokenText[i] = value;

					return (): void => {
						dom.data = brokenText.join('');
					};
				};

				addModifier(modifiers, modifierName[0], modifierAction);
			}
		}
	}

	return { dom, modifiers };
};
