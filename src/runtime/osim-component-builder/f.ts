import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';

export default (childs = []): IOsimNode => {
	// const fragment = document.createDocumentFragment();
	let modifiers = {};
	const order = [];

	childs.forEach((child): void => {
		// fragment.appendChild(child);
		order.splice(1, 0, ...child.order);
		modifiers = deepmerge(modifiers, child.modifiers);
	});

	return { dom: null, modifiers, order };
};
