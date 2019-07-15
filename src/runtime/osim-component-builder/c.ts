import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';
import { matchModifierName } from '../consts/regexes';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (componentName: string, props, childs): IOsimNode => {
	// const dom = { appendChild(fwe) {} } as any;
	const dom = document.createDocumentFragment();
	const [, uid] = props.find(([name]): boolean => name.startsWith('osim'));
	let builderComponent: IOsimNode = {
		dom,
		builtins: [],
		modifiersActions: {},
		order: [uid],
		requestedProps: {},
	};

	props.reduce((requestedProps, [name, value]) => {
		const modifierName = value.match(matchModifierName);

		if (modifierName) {
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
	}, builderComponent.requestedProps);

	childs.forEach((child) => (builderComponent = deepmerge(builderComponent, child, runtimeDeepmergeOptions)));
	return builderComponent;
};
