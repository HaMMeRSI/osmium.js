import { matchDynamicGetter, matchDynamicGetterName } from '../consts/regexes';
import { IModifierManager, IOsimNode } from '../runtime-interfaces';
import { resolveObjectKey, getAccessorFromString } from '../helpers/objectFunctions';
import { OsimNode } from '../osim-node/OsimNode';

export default (modifierManager: IModifierManager) => (text: string): IOsimNode => {
	const dom: Text = document.createTextNode(text);
	const tONode = new OsimNode(dom);

	const textModifiers = text.match(matchDynamicGetter);

	if (textModifiers) {
		dom.nodeValue = '';
		const splitedText = text.split(matchDynamicGetter);
		const brokenText: string[] = textModifiers.flatMap((modifierName, i): string[] => [splitedText[i], modifierName]);
		brokenText.push(splitedText[splitedText.length - 1]);

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
				tONode.addRemover(modifierManager.addAction(modifierName[0], action));
			}
		}
	}

	return tONode;
};
