import { IOsimBuildChilds, IOsmiumModifiers } from './../runtime-interfaces';
import * as deepmerge from 'deepmerge';
import { IOsimNode, IBuiltins } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (nodeName: string, usedModifiers: string[] = [], evalChild: (modifiers) => IOsimBuildChilds): ((dom: HTMLElement) => IOsimNode) => {
	return (dom: HTMLElement): IOsimNode => {
		let childNodes: ChildNode[] = [];
		let unregisterFromModfiers = null;
		const builtins: IBuiltins[] = [
			{
				usedModifiers,
				evaluationFunction: (passedModifiers: IOsmiumModifiers): IOsimNode => {
					let onodeBuiltin: IOsimNode = {
						dom: document.createDocumentFragment(),
						builtins: [],
						modifiersActions: {},
						order: [],
						requestedProps: {},
					};

					let evaluatedBuiltin = evalChild(passedModifiers);
					if (evaluatedBuiltin === null) {
						if (childNodes.length > 0) {
							for (const domElm of childNodes) {
								domElm.parentNode.removeChild(domElm);
							}

							unregisterFromModfiers();
							childNodes = [];
							unregisterFromModfiers = null;
						}
					} else if (typeof evaluatedBuiltin === 'function') {
						evaluatedBuiltin = (evaluatedBuiltin as any)(dom);
					}

					if (evaluatedBuiltin) {
						onodeBuiltin = deepmerge(onodeBuiltin, evaluatedBuiltin, runtimeDeepmergeOptions);

						const unregistrers = Object.entries(onodeBuiltin.modifiersActions).map(([fullModifierName, actions]) => {
							const [componentUid, modifierName]: string[] = fullModifierName.split('.');
							return passedModifiers[componentUid][modifierName].addActions(actions);
						});
						unregisterFromModfiers = (): void => {
							unregistrers.forEach((unregistrer) => unregistrer());
						};

						childNodes = Array.from(onodeBuiltin.dom.childNodes);
						dom.appendChild(onodeBuiltin.dom);
					}

					return onodeBuiltin;
				},
			},
		];

		return {
			dom: document.createDocumentFragment(),
			modifiersActions: {},
			requestedProps: {},
			builtins,
			order: [],
		};
	};
};
