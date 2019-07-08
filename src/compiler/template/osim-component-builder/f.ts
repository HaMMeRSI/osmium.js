import { IOsimNode } from '../../compiler-interfaces';
import * as deepmerge from 'deepmerge';

export default (childs = []): IOsimNode => {
	// const fragment = document.createDocumentFragment();
	let modifiers = {};

	childs.forEach((child): void => {
		// fragment.appendChild(child);
		modifiers = deepmerge(modifiers, child.modifiers);
	});

	return { dom: null, modifiers };
};
