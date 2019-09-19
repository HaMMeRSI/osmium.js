import { IOsimNode, IModifierManager, ComponentFuncs, IOsimChilds } from '../runtime-interfaces';
import { OsimBuiltinNode } from '../osim-node/OsimBuiltinNode';

type ONodeGen = (iterationModifierName: string) => IOsimChilds;

export default (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => (
	usedScopedModifierNames: string[],
	uid: string,
	loopModifier,
	onodeGen: ONodeGen
): IOsimNode => {
	return new OsimBuiltinNode(uid, usedScopedModifierNames, (oNode: OsimBuiltinNode) => {
		oNode.removeChilds();
		const generatedONodes = Object.keys(modifiersManager.getModifier(`${loopModifier}`)).map((key) => onodeGen(`${loopModifier}.${key}`));

		generatedONodes.forEach((iter) => {
			iter.forEach((child) => {
				oNode.addChild(child);
				child.compute(componentFuncs, modifiersManager);
			});
		});
	});
};
