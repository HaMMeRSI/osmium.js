import { matchDynamicGetter, matchDynamicGetterName } from '../consts/regexes';
import { IOsimNode } from '../runtime-interfaces';
import { createModifier } from '../helpers/modifier-methods';

export default (text: string): IOsimNode => {
	// const dom: Text = {} as any;
	const dom: Text = document.createTextNode(text);
	const textModifiers = text.match(matchDynamicGetter);
	const modifiers = {};

	if (textModifiers) {
		dom.nodeValue = '';
		const splitedText = text.split(matchDynamicGetter);
		const brokenText: string[] = textModifiers.flatMap((modifierName, i): string[] => [splitedText[i], modifierName]);

		for (let i = 0; i < brokenText.length; i++) {
			const modifierName = brokenText[i].match(matchDynamicGetterName);

			if (modifierName) {
				const modifierAction = (value: string): void => {
					brokenText[i] = value;
					dom.data = brokenText.join('');
				};

				dom.data = brokenText.join('');
				createModifier(modifiers, modifierName[0], modifierAction);
			}
		}
	}

	return { dom, modifiersActions: modifiers, requestedProps: {}, order: [], builtins: [] };
};
