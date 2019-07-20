import { IOsimChilds } from './../runtime-interfaces';
import { IOsimNode, IBuiltins } from '../runtime-interfaces';
import { getConditionBuiltinEvaluationFunction } from './builtins/osim-if';

export default (nodeName: string, usedModifiers: string[] = [], childEvaluationFunction: (modifiers) => IOsimChilds): IOsimNode => {
	const builtinPlaceHolder = document.createComment('b-ph');

	const builtins: IBuiltins[] = [];
	if (nodeName === 'osim-if') {
		builtins.push({
			usedModifiers,
			evaluationFunction: getConditionBuiltinEvaluationFunction(childEvaluationFunction, builtinPlaceHolder),
		});
	}

	return {
		dom: builtinPlaceHolder,
		modifiersActions: {},
		requestedProps: {},
		builtins,
		order: [],
	};
};
