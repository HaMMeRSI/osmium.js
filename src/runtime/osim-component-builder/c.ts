import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';
import { matchModifierName } from '../consts/regexes';

export default (componentName: string, props, childs): IOsimNode => {
	const dom = { appendChild(fwe) {} } as any;
	// const dom = document.createDocumentFragment();
	const staticProps = [];
	const [, uid] = props.find(([name]): boolean => name.startsWith('osim'));
	const order = [uid];
	let modifiers = {};
	const requestedProps = {};

	props.forEach(([name, value]): void => {
		const modifierName = value.match(matchModifierName);

		if (!modifierName) {
			staticProps.push([name, value]);
		} else {
			const requestedProp = {
				attr: name,
				modifier: modifierName[0],
			};

			if (uid in requestedProps) {
				requestedProps[uid].push(requestedProp);
			} else {
				requestedProps[uid] = [requestedProp];
			}
		}
	});

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
