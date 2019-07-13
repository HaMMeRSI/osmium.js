import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';

export default (childs = []): IOsimNode => {
	const dom = { appendChild: (fe) => {} } as any;
	// const dom = document.createDocumentFragment();
	let modifiers = {};
	const order = [];

	const requestedProps = {};
	childs.forEach((child: IOsimNode): void => {
		dom.appendChild(child.dom);
		order.splice(1, 0, ...child.order);
		modifiers = deepmerge(modifiers, child.modifiersActions);
		Object.assign(requestedProps, child.requestedProps);
	});

	return {
		dom,
		modifiersActions: modifiers,
		requestedProps,
		order,
	};
};
