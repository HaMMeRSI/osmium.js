import { matchDynamicGetter, matchDynamicGetterName } from '../consts/regexes';
import { IOsimNode } from '../runtime-interfaces';
import { createModifier } from '../helpers/modifier-methods';
import { resolveObjectKey, getAccessorFromString } from '../helpers/objectFunctions';

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
					if (typeof value === 'object') {
						brokenText[i] = resolveObjectKey(getAccessorFromString(modifierName[0]), value);
					} else {
						brokenText[i] = value;
					}
					dom.data = brokenText.join('');
				};

				dom.data = brokenText.join('');
				createModifier(modifiers, modifierName[0].split('.')[0], modifierAction);
			}
		}
	}

	return { dom, modifiersActions: modifiers, requestedProps: {}, order: [], builtins: [] };
};
