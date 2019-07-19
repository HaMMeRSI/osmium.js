import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (childs = []): IOsimNode => {
	let onodeFragment: IOsimNode = {
		dom: document.createDocumentFragment(),
		builtins: [],
		modifiersActions: {},
		order: [],
		requestedProps: {},
	};

	childs.forEach((child) => {
		onodeFragment = deepmerge(onodeFragment, child, runtimeDeepmergeOptions);
	});

	return onodeFragment;
};
