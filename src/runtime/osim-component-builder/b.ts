import { IOsimChilds } from './../runtime-interfaces';
import { IOsimNode, IBuiltins } from '../runtime-interfaces';
import { getConditionBuiltin } from './builtins/osim-if';

export default (nodeName: string, usedModifiers: string[] = [], evalChild: (modifiers) => IOsimChilds): IOsimNode => {
	const nodePlaceHolder = document.createComment('b-ph');

	const builtins: IBuiltins[] = [];
	if (nodeName === 'osim-if') {
		builtins.push(getConditionBuiltin(evalChild, nodePlaceHolder, usedModifiers));
	}

	return {
		dom: nodePlaceHolder,
		modifiersActions: {},
		requestedProps: {},
		builtins,
		order: [],
	};
};
