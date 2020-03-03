import { ComponentUid, EvaluationFunction } from '../runtime-interfaces';
import { IOsimNode, IModifierManager } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';
import { OsimNodeAttrs } from '../../common/interfaces';

export default (modifierManager: IModifierManager) => (componentName: string, componentUid: ComponentUid, attrs: OsimNodeAttrs, childs: EvaluationFunction): IOsimNode => {
	const ocNode = new OsimComponentNode(componentName, componentUid, attrs, childs(componentUid));
	ocNode.addRemover(() => {
		modifierManager.removeComponent(componentUid);
	});

	return ocNode;
};
