import { IOsimBuildChilds } from './../runtime-interfaces';
import { IOsimNode, IBuiltins } from '../runtime-interfaces';
import { getConditionBuiltin } from './builtins/osim-if';

export default (nodeName: string, usedModifiers: string[] = [], evalChild: (modifiers) => IOsimBuildChilds): ((dom: HTMLElement) => IOsimNode) => {
	return (dom: HTMLElement): IOsimNode => {
		const nodePlaceHolder = document.createComment('b-ph');

		const builtins: IBuiltins[] = [];
		if (nodeName === 'osim-if') {
			builtins.push(getConditionBuiltin(evalChild, nodePlaceHolder, dom));
		}

		return {
			dom: nodePlaceHolder,
			modifiersActions: {},
			requestedProps: {},
			builtins,
			order: [],
		};
	};
};
