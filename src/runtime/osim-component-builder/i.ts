import { IOsimNode, IModifierManager, ComponentFuncs, EvaluationFunction } from '../runtime-interfaces';
import { OsimBuiltinNode } from '../osim-node/OsimBuiltinNode';

export default (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => (
	usedModifiers: string[],
	uid: string,
	builtinFunction: EvaluationFunction
): IOsimNode => {
	return new OsimBuiltinNode(uid, usedModifiers, (oNode: OsimBuiltinNode) => {
		const evaluatedONodes = builtinFunction(modifiersManager.getModifier);

		if (evaluatedONodes === null) {
			if (oNode.isEvaluated) {
				oNode.isEvaluated = false;
				oNode.removeChilds();
				modifiersManager.removeComponent(oNode.uid);
			}
		} else if (!oNode.isEvaluated) {
			oNode.isEvaluated = true;
			evaluatedONodes.forEach((child) => {
				oNode.addChild(child);
				child.compute(componentFuncs, modifiersManager);
			});
		}
	});
};
