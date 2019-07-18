import { IOsimBuildChilds } from './../runtime-interfaces';
import * as deepmerge from 'deepmerge';
import { IOsimNode, IBuiltins } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (nodeName: string, usedModifiers: string[] = [], evalChild: (modifiers) => IOsimBuildChilds): ((dom: HTMLElement) => IOsimNode) => {
	return (dom: HTMLElement): IOsimNode => {
		let childNodes: ChildNode[] = [];
		const builtins: IBuiltins[] = [
			{
				usedModifiers,
				evaluationFunction: (passedModifiers): IOsimNode => {
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

							childNodes = [];
						}
					} else if (typeof evaluatedBuiltin === 'function') {
						evaluatedBuiltin = (evaluatedBuiltin as any)(dom);
					}

					if (evaluatedBuiltin) {
						onodeBuiltin = deepmerge(onodeBuiltin, evaluatedBuiltin, runtimeDeepmergeOptions);
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
