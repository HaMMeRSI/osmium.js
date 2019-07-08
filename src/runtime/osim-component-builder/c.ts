import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';

type componentBuilder = () => DocumentFragment;
export default (componentName: string, props, childs): IOsimNode => {
	const staticProps = [];
	const order = [componentName];
	let modifiers = {};

	props.forEach(([name, value]): void => {
		const dyn = value.match(/(?<=\$\{).*?(?=})/);
		if (!dyn) {
			staticProps.push([name, value]);
		}
	});

	childs.forEach((child: IOsimNode): void => {
		order.splice(1, 0, ...child.order);
		modifiers = deepmerge(modifiers, child.modifiers);
	});

	return {
		dom: null,
		modifiers,
		order,
	};
};
