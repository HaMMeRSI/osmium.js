import * as deepmerge from 'deepmerge';
import { IOsimNode, IBuiltins } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (nodeName: string, usedModifiers: string[] = [], evalChild: (modifiers) => IOsimNode[]): IOsimNode => {
	// const dom = { appendChild: (fe) => {} } as any;
	const dom = document.createDocumentFragment();
	const builtins: IBuiltins[] = [
		{
			usedModifiers: usedModifiers,
			evaluationFunction: (passedModifiers): IOsimNode => {
				const builderBuiltin: IOsimNode = {
					dom,
					builtins: [],
					modifiersActions: {},
					order: [],
					requestedProps: {},
				};

				const evaluatedChilds = evalChild(passedModifiers);
				if (evaluatedChilds) {
					evaluatedChilds.forEach((child) => deepmerge(builderBuiltin, child, runtimeDeepmergeOptions));
				}

				return builderBuiltin;
			},
		},
	];

	return {
		dom,
		modifiersActions: {},
		requestedProps: {},
		builtins,
		order: [],
	};
};

// const requestedProps = {};
// let modifiers = {};
// const order = [];
// const childBuiltins = [];
// evaluatedChild.forEach((child: IOsimNode): void => {
// 	dom.appendChild(child.dom);
// 	order.splice(1, 0, ...child.order);
// 	childBuiltins.splice(childBuiltins.length, 0, ...child.order);
// 	modifiers = deepmerge(modifiers, child.modifiersActions);
// 	Object.assign(requestedProps, child.requestedProps);
// });
// return {
// 	dom,
// 	modifiersActions: modifiers,
// 	requestedProps,
// 	builtins: childBuiltins,
// 	order,
// };
