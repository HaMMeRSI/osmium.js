import { IOsimNode, IModifierManager, ComponentFuncs, EvaluationFunction } from '../runtime-interfaces';
import { OsimBuiltinNode } from '../osim-node/OsimBuiltinNode';
import { extractModifierName } from '../../compiler/template/match';
import { matchModifierName } from '../consts/regexes';

export default (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => (
	usedScopedModifierNames: string[],
	uid: string,
	builtinFunction: EvaluationFunction
): IOsimNode => {
	usedScopedModifierNames = usedScopedModifierNames.map((m) => extractModifierName(matchModifierName, m));
	return new OsimBuiltinNode(uid, usedScopedModifierNames, (oNode: OsimBuiltinNode) => {
		const evaluatedONodes = builtinFunction(uid);

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
