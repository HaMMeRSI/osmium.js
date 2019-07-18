import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (childs = []): ((dom: HTMLElement) => IOsimNode) => {
	return (dom: HTMLElement) => {
		let onodeFragment: IOsimNode = {
			dom: document.createDocumentFragment(),
			builtins: [],
			modifiersActions: {},
			order: [],
			requestedProps: {},
		};

		childs.forEach((child) => {
			let resolvedChild = child;
			if (typeof child === 'function') {
				resolvedChild = child(dom);
			}

			onodeFragment = deepmerge(onodeFragment, resolvedChild, runtimeDeepmergeOptions);
		});
		return onodeFragment;
	};
};
