import { IOsimNode, IModifierManager, ComponentFuncs, IOsimChilds } from '../runtime-interfaces';
import { OsimBuiltinNode } from '../osim-node/OsimBuiltinNode';
import { extractModifierName } from '../../compiler/template/match';
import { matchModifierName } from '../consts/regexes';

type ONodeGen = (modifier: unknown, i: number) => IOsimChilds;

export default (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => (loopModifier, uid: string, onodeGen: ONodeGen): IOsimNode => {
	loopModifier = extractModifierName(matchModifierName, loopModifier);
	return new OsimBuiltinNode(uid, [loopModifier], (oNode: OsimBuiltinNode) => {
		oNode.removeChilds();
		const generatedONodes = Object.keys(modifiersManager.getModifier(loopModifier)).map((key, i) => onodeGen(`${loopModifier}[${key}]`, i));
		// const generatedONodes = Object.entries(modifiersManager.getModel(loopModifier)).map(([key, value]) => onodeGen(value, key));

		generatedONodes.forEach((iter) => {
			iter.forEach((child) => {
				oNode.addChild(child);
				child.compute(componentFuncs, modifiersManager);
			});
		});
	});
};
