import { IBuiltinData } from './../runtime-interfaces';
import { IOsimNode, IBuiltins } from '../runtime-interfaces';
import { getConditionBuiltinEvaluationFunction } from './builtins/osim-if';
import { getLoopBuiltinEvaluationFunction } from './builtins/loop-builtin';

export default (
	nodeName: string,
	builtinData: IBuiltinData,
	uid: string,
	childEvaluationFunction: (modifiers) => () => IOsimNode
): IOsimNode => {
	const domPlaceHolder = document.createComment('b-ph');

	const builtins: IBuiltins[] = [];
	if (nodeName === 'osim-if') {
		builtins.push({
			uid,
			type: 'condition',
			builtinData,
			evaluationFunction: getConditionBuiltinEvaluationFunction(childEvaluationFunction, domPlaceHolder),
		});
	} else if (nodeName === 'osim-for') {
		builtins.push({
			uid,
			type: 'loop',
			builtinData,
			evaluationFunction: getLoopBuiltinEvaluationFunction(
				childEvaluationFunction,
				builtinData.loop.split(' ')[0],
				domPlaceHolder
			),
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
