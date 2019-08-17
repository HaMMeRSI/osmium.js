import { IOsimNodeData, IModifierManager, EvaluationFunction } from '../../runtime-interfaces';

export const getConditionBuiltinEvaluationFunction = (uid: string, builtinCondition: EvaluationFunction, domPlaceHolder: Node[], parent) => {
	// let remove = null;
	// return (modifiersManager: IModifierManager): IOsimNodeData => {
	// const newONodeLauncher = builtinCondition(modifiersManager.modifiers);
	// if (newONodeLauncher === null) {
	// 	remove();
	// 	return null;
	// }
	// const comment = domPlaceHolder[0];
	// const newONode = newONodeLauncher(domPlaceHolder[0] as Comment, true);
	// remove = () => {
	// 	newONode.removers.forEach((remover) => remover());
	// 	modifiersManager.removeComponent(uid);
	// 	remove = null;
	// };
	// return newONode;
	// };
};
