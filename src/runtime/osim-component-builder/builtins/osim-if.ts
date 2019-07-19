import * as deepmerge from 'deepmerge';
import { IOsmiumModifiers, IOsimNode } from '../../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../../helpers/deepmerge-options';

export const getConditionBuiltin = (evalChild, nodePlaceHolder, usedModifiers) => {
	let childNodes: ChildNode[] = [];
	let unregisterFromModfiers = null;

	return {
		usedModifiers,
		evaluationFunction: (passedModifiers: IOsmiumModifiers): IOsimNode => {
			let onodeBuiltin: IOsimNode = {
				dom: document.createDocumentFragment(),
				builtins: [],
				modifiersActions: {},
				order: [],
				requestedProps: {},
			};

			const evaluatedBuiltin = evalChild(passedModifiers);
			if (evaluatedBuiltin === null) {
				if (childNodes.length > 0) {
					childNodes[0].replaceWith(nodePlaceHolder);

					for (let i = 1; i < childNodes.length; i++) {
						childNodes[i].parentNode.removeChild(childNodes[i]);
					}

					unregisterFromModfiers();
					childNodes = [];
					unregisterFromModfiers = null;
				}
			} else {
				onodeBuiltin = deepmerge(onodeBuiltin, evaluatedBuiltin, runtimeDeepmergeOptions);

				const unregistrers = Object.entries(onodeBuiltin.modifiersActions).map(([fullModifierName, actions]) => {
					const [componentUid, modifierName]: string[] = fullModifierName.split('.');
					return passedModifiers[componentUid][modifierName].addActions(actions);
				});
				unregisterFromModfiers = (): void => {
					unregistrers.forEach((unregistrer) => unregistrer());
				};

				childNodes = Array.from(onodeBuiltin.dom.childNodes);
				// dom.appendChild(onodeBuiltin.dom);
				nodePlaceHolder.replaceWith(onodeBuiltin.dom);
			}

			return onodeBuiltin;
		},
	};
};
