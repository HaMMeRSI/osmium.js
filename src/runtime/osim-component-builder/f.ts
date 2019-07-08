import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';

export default (childs = []): IOsimNode => {
	const dom = document.createDocumentFragment();
	let modifiers = {};
	const order = [];

	childs.forEach((child: IOsimNode): void => {
		dom.appendChild(child.dom);
		order.splice(1, 0, ...child.order);
		modifiers = deepmerge(modifiers, child.modifiers);
	});

	return { dom, modifiers, props: [], order };
};
