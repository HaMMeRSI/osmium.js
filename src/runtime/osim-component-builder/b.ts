import { IBuiltinData, EvaluationFunction, IOsimNode, IModifierManager, ComponentFuncs } from '../runtime-interfaces';
import { OsimBuiltinNode } from '../osim-node/OsimBuiltinNode';

export default (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => (
	nodeName: string,
	builtinData: IBuiltinData,
	uid: string,
	builtinFunction: EvaluationFunction
): IOsimNode => {
	return new OsimBuiltinNode(uid, builtinData.usedModifiers, (oNode) => {
		const evaluatedONodes = builtinFunction(modifiersManager.modifiers);

		if (evaluatedONodes === null) {
			oNode.removeChilds();
			modifiersManager.removeComponent(oNode.uid);
		} else {
			evaluatedONodes.forEach((child) => {
				oNode.addChild(child);
				child.compute(componentFuncs, modifiersManager);
			});
		}
	});
};
