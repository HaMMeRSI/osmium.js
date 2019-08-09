import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (childs = []): IOsimNode => {
	let onodeFragment: IOsimNode = {
		dom: document.createDocumentFragment(),
		builtins: [],
		removers: [],
		order: [],
		requestedProps: {},
	};

	childs.forEach((child) => {
		onodeFragment = deepmerge(onodeFragment, child, runtimeDeepmergeOptions);
	});

	return onodeFragment;
};
