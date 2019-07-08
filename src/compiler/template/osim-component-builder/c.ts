import { IOsimNode } from '../../compiler-interfaces';
import * as deepmerge from 'deepmerge';

type componentBuilder = () => DocumentFragment;
export default (component: componentBuilder, props, childs): IOsimNode => {
	const staticProps = [];
	let modifiers = {};

	props.forEach(([name, value]): void => {
		const dyn = value.match(/(?<=\$\{).*?(?=})/);
		if (!dyn) {
			staticProps.push([name, value]);
		}
	});

	childs.forEach((child): void => {
		modifiers = deepmerge(modifiers, child.modifiers);
	});

	return {
		dom: null,
		modifiers,
	};
};
