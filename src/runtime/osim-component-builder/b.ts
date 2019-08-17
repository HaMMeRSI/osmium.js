import { IBuiltinData, EvaluationFunction, IOsimNode, IModifierManager, ComponentFuncs } from '../runtime-interfaces';
import { OsimBuiltinNode } from '../osim-node/OsimBuiltinNode';

export default (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => (
	nodeName: string,
	builtinData: IBuiltinData,
	uid: string,
	builtinFunction: EvaluationFunction
): IOsimNode => {
	const bONode = new OsimBuiltinNode(uid, builtinData.usedModifiers, builtinFunction);

	// const calculateBuiltin = () => {
	// 	const evaluatedONodes = builtinFunction(modifiersManager.modifiers);

	// 	if (evaluatedONodes === null) {
	// 		bONode.removeChilds();
	// 		modifiersManager.removeComponent(uid);
	// 	} else {
	// 		evaluatedONodes.forEach((child) => bONode.addChild(child));
	// 		bONode.compute(componentFuncs, modifiersManager);
	// 	}
	// };

	// for (const requestedModifier of builtinData.usedModifiers) {
	// 	bONode.addRemover(modifiersManager.addListener(requestedModifier, calculateBuiltin));
	// }

	return bONode;
};
