import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';
import { matchDynamicGetterName } from '../consts/regexes';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (componentName: string, props, childs): IOsimNode => {
	const [, uid] = props.find(([name]): boolean => name.startsWith('osim'));
	let onodeComponent: IOsimNode = {
		dom: document.createDocumentFragment(),
		builtins: [],
		modifiersActions: {},
		order: [{ componentName, uid }],
		requestedProps: {},
	};

	props.reduce((requestedProps, [name, value]) => {
		const dynamicGetter = value.match(matchDynamicGetterName);

		if (dynamicGetter) {
			const requestedProp = {
				attr: name,
				modifier: dynamicGetter[0].split('.')[0],
			};

			if (uid in requestedProps) {
				requestedProps[uid].push(requestedProp);
			} else {
				requestedProps[uid] = [requestedProp];
			}
		}

		return requestedProps;
	}, onodeComponent.requestedProps);

	childs.forEach((child) => {
		onodeComponent = deepmerge(onodeComponent, child, runtimeDeepmergeOptions);
	});

	return onodeComponent;
};
