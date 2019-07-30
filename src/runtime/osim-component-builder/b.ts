import { IOsimChilds } from './../runtime-interfaces';
import { IOsimNode, IBuiltins } from '../runtime-interfaces';
import { getConditionBuiltinEvaluationFunction } from './builtins/osim-if';

export default (
	nodeName: string,
	usedModifiers: string[] = [],
	uid: string,
	childEvaluationFunction: (modifiers) => () => IOsimNode
): IOsimNode => {
	const domPlaceHolder = document.createComment('b-ph');

	const builtins: IBuiltins[] = [];
	if (nodeName === 'osim-if') {
		builtins.push({
			uid,
			usedModifiers,
			evaluationFunction: getConditionBuiltinEvaluationFunction(childEvaluationFunction, domPlaceHolder),
		});
	}

	return {
		dom: domPlaceHolder,
		modifiersActions: {},
		requestedProps: {},
		builtins,
		order: [],
	};
};
