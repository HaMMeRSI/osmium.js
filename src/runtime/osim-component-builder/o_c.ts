import { IOsimChilds, IOsimNode, IModifierManager } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';
import { OsimNodeAttrs } from '../../common/interfaces';
import { OSIM_UID } from '../../compiler/template/consts';

export default (modifierManager: IModifierManager) => (componentName: string, attrs: OsimNodeAttrs, childs: IOsimChilds): IOsimNode => {
	const ocNode = new OsimComponentNode(componentName, attrs, childs);
	const uid = attrs.find(([name]): boolean => name === OSIM_UID)[1];
	ocNode.addRemover(() => {
		modifierManager.removeComponent(uid);
	});

	return ocNode;
};
