import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';

export default (componentName: string, props, childs): IOsimNode => {
	const dom = document.createDocumentFragment();
	const staticProps = [];
	const order = [props.find(([name]): boolean => name.startsWith('osim'))[1]];
	let modifiers = {};

	props.forEach(([name, value]): void => {
		const dyn = value.match(/(?<=\$\{).*?(?=})/);
		if (!dyn) {
			staticProps.push([name, value]);
		}
	});

	childs.forEach((child: IOsimNode): void => {
		dom.appendChild(child.dom);
		order.splice(1, 0, ...child.order);
		modifiers = deepmerge(modifiers, child.modifiers);
	});

	return {
		dom,
		modifiers,
		props: [],
		order,
	};
};
