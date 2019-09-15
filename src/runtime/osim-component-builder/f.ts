import { IOsimNode, IModifierManager, ComponentFuncs } from '../runtime-interfaces';
import { OsimBuiltinNode } from '../osim-node/OsimBuiltinNode';

type ONodeGen = (iterationModifierName: string) => IOsimNode;

export default (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => (usedModifiers: string[], uid: string, loopModifier, onodeGen: ONodeGen): IOsimNode => {
	return new OsimBuiltinNode(uid, usedModifiers, (oNode: OsimBuiltinNode) => {
		oNode.removeChilds();
		const generatedONodes = modifiersManager.getModifier(`${loopModifier}`).map((_, i) => onodeGen(`${loopModifier}.${i}`));

		generatedONodes.forEach((iter) => {
			iter.forEach((child) => {
				oNode.addChild(child);
				child.compute(componentFuncs, modifiersManager);
			});
		});
	});
};
