import { IModifierManager, ComponentFuncs, IOsimNode, IOsimChilds } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';

type AppLauncher = (target: HTMLElement, componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => IOsimNode;

export default (osmiumApp: IOsimChilds): AppLauncher => (target, componentFuncs, modifiersManager): IOsimNode => {
	const root: IOsimNode = new OsimComponentNode('root', [['osim:uid', 'root']], osmiumApp);
	root.compute(componentFuncs, modifiersManager);
	target.appendChild(root.dom);

	return root;
};
