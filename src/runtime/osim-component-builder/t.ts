import { matchDynamicGetter, matchDynamicGetterName } from '../consts/regexes';
import { IOsimNode, IModifierManager } from '../runtime-interfaces';
import { resolveObjectKey, getAccessorFromString } from '../helpers/objectFunctions';

export default (modifierManager: IModifierManager) => (text: string): IOsimNode => {
	const dom: Text = document.createTextNode(text);
	const textModifiers = text.match(matchDynamicGetter);
	const removers: (() => void)[] = [];

	if (textModifiers) {
		dom.nodeValue = '';
		const splitedText = text.split(matchDynamicGetter);
		const brokenText: string[] = textModifiers.flatMap((modifierName, i): string[] => [splitedText[i], modifierName]);

		for (let i = 0; i < brokenText.length; i++) {
			const modifierName = brokenText[i].match(matchDynamicGetterName);

			if (modifierName) {
				const action = (value): void => {
					if (typeof value === 'object') {
						brokenText[i] = resolveObjectKey(getAccessorFromString(modifierName[0]), value);
					} else {
						brokenText[i] = value;
					}
					dom.data = brokenText.join('');
				};

				dom.data = brokenText.join('');
				removers.push(modifierManager.addAction(modifierName[0], action));
			}
		}
	}

	return { dom, removers, requestedProps: {}, order: [], builtins: [] };
};
