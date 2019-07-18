import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';
import { matchModifierName } from '../consts/regexes';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (componentName: string, props, childs): ((dom: HTMLElement) => IOsimNode) => {
	return (dom: HTMLElement) => {
		const [, uid] = props.find(([name]): boolean => name.startsWith('osim'));
		let onodeComponent: IOsimNode = {
			dom: document.createDocumentFragment(),
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
		}, onodeComponent.requestedProps);

		childs.forEach((child) => {
			let resolvedChild = child;
			if (typeof child === 'function') {
				resolvedChild = child(dom);
			}

			onodeComponent = deepmerge(onodeComponent, resolvedChild, runtimeDeepmergeOptions);
		});
		return onodeComponent;
	};
};
