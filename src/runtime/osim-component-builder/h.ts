import { matchModifierName } from '../consts/regexes';
import { resolveObjectKey, getAccessorFromString } from '../helpers/objectFunctions';
import { IModifierManager, IOsimChilds, IOsimNode, ModifierAction } from '../runtime-interfaces';
import { OsimNode } from '../osim-node/OsimNode';

export default (modifierManager: IModifierManager) => (tagName: string = 'div', attrs: string[] = [], childs: IOsimChilds = []): IOsimNode => {
	const dom = document.createElement(tagName);
	const hONode = new OsimNode(dom, childs);

	attrs.forEach(([name, value]): void => {
		const modifierAccessorName: RegExpMatchArray = value.match(matchModifierName);

		if (modifierAccessorName) {
			let action: ModifierAction = (newAttrValue): void => {
				if (typeof newAttrValue === 'object') {
					dom.setAttribute(name, resolveObjectKey(getAccessorFromString(modifierAccessorName[0]), newAttrValue));
				} else {
					dom.setAttribute(name, newAttrValue);
				}
			};

			if (name.startsWith('@')) {
				action = (newAttrValue: (e) => void): void => {
					// This test is because auto activate action
					if (newAttrValue) {
						// dom.removeEventListener(eventName, oldAttrValue);
						dom.addEventListener(name.slice(1), newAttrValue);
					}
				};
			}

			hONode.addRemover(modifierManager.addAction(modifierAccessorName[0], action));
		} else {
			dom.setAttribute(name, value);
		}
	});

	return hONode;
};
