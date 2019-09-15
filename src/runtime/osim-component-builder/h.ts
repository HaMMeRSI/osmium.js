import { matchModifierName } from '../consts/regexes';
import { resolveObjectKey, getAccessorFromString } from '../helpers/objectFunctions';
import { IModifierManager, IOsimChilds, IOsimNode, ModifierAction } from '../runtime-interfaces';
import { OsimNode } from '../osim-node/OsimNode';

export default (modifierManager: IModifierManager) => (tagName: string = 'div', attrs: string[] = [], childs: IOsimChilds = []): IOsimNode => {
	const dom = document.createElement(tagName);
	const hONode = new OsimNode(dom, childs);

	attrs.forEach(([name, value]): void => {
		const modifierName: RegExpMatchArray = value.match(matchModifierName);

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

			hONode.addRemover(modifierManager.addAction(modifierName[0], action));
		} else {
			dom.setAttribute(name, value);
		}
	});

	return hONode;
};
