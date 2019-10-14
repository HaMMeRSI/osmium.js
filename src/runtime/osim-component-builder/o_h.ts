import { matchModifierName, matchFuncCall, matchPrefixAttr } from '../consts/regexes';
import { resolveObjectKey, getAccessorFromString } from '../helpers/objectFunctions';
import { IModifierManager, IOsimChilds, IOsimNode, ModifierAction } from '../runtime-interfaces';
import { OsimNode } from '../osim-node/OsimNode';

function updateDomAttr(dom: HTMLElement, attrName: string, attrValue: string) {
	if (attrName in dom) {
		dom[attrName] = attrValue;
	} else {
		dom.setAttribute(attrName, attrValue);
	}
}

function getDomAttr(dom: HTMLElement, attrName: string) {
	if (attrName in dom) {
		return dom[attrName];
	} else {
		return dom.getAttribute(attrName);
	}
}

export default (modifierManager: IModifierManager) => (tagName: string = 'div', attrs: string[] = [], childs: IOsimChilds = []): IOsimNode => {
	const dom = document.createElement(tagName);
	const hONode = new OsimNode(dom, childs);

	attrs.forEach(([prefixedAttrName, value]): void => {
		const modifierAccessorNameMatch: RegExpMatchArray = value.match(matchModifierName);
		const [, prefix, attrName] = prefixedAttrName.match(matchPrefixAttr);

		if (modifierAccessorNameMatch) {
			let modifierAccessorName = modifierAccessorNameMatch[0];
			let action: ModifierAction = (newAttrValue): void => {
				if (typeof newAttrValue === 'object') {
					updateDomAttr(dom, attrName, resolveObjectKey(getAccessorFromString(modifierAccessorName), newAttrValue));
				} else {
					updateDomAttr(dom, attrName, newAttrValue);
				}
			};

			if (prefix === '@') {
				action = (newAttrValue: (e) => void): void => {
					// This test is because auto activate action
					if (newAttrValue) {
						// dom.removeEventListener(eventName, oldAttrValue);
						// const res = [...(modifierAccessorName as any).matchAll(matchFuncCall)][0];
						const [, callee, strArgs] = matchFuncCall.exec(modifierAccessorName);
						const args = strArgs ? strArgs.split(',') : [];
						modifierAccessorName = callee;
						dom.addEventListener(attrName, (e) => {
							const nargs = args.map((arg) => {
								const modifierNameMatch = arg.match(matchModifierName);
								if (arg === '$event') {
									return e;
								} else if (modifierNameMatch) {
									return modifierManager.getModifier(modifierNameMatch[0]);
								} else {
									return arg;
								}
							});

							newAttrValue.call(window, ...nargs);
						});
					}
				};
			} else {
				if (!modifierManager.getModel(modifierAccessorName)) {
					modifierManager.setModifier(modifierAccessorName, getDomAttr(dom, attrName));
				}

				if (prefix === ':') {
					updateDomAttr(dom, attrName, modifierManager.getModel(modifierAccessorName));

					const onChange = (e) => {
						const targetProp = ['radio', 'checkbox'].includes((dom as HTMLInputElement).type) ? 'checked' : 'value';
						modifierManager.setModifier(modifierAccessorName, e.target[targetProp]);
					};

					dom.addEventListener('change', onChange);
					hONode.addRemover(() => dom.removeEventListener('change', onChange));
				}
			}

			hONode.addRemover(modifierManager.addAction(modifierAccessorName, action));
		} else {
			updateDomAttr(dom, attrName, value);
		}
	});

	return hONode;
};
