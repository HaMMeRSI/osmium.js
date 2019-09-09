import { IOsimNode, IModifierManager, ComponentFuncs, EvaluationFunction } from '../runtime-interfaces';
import { OsimBuiltinNode } from '../osim-node/OsimBuiltinNode';

export default (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => (
	nodeName: string,
	usedModifiers: string[],
	uid: string,
	builtinFunction: EvaluationFunction
): IOsimNode => {
	if (nodeName === 'osim-if') {
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
	}

	return new OsimBuiltinNode(uid, usedModifiers, (oNode: OsimBuiltinNode) => {
		const evaluatedONodes = builtinFunction(modifiersManager.getModifier);

		evaluatedONodes.forEach((iter) => {
			iter.forEach((child) => {
				oNode.addChild(child);
				child.compute(componentFuncs, modifiersManager);
			});
		});
	});
};
