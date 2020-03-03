import { IModifierManager, ComponentFuncs, IOsimNode, IOsimChilds } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';

type AppLauncher = (target: HTMLElement, componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => IOsimNode;

export default (osmiumApp: IOsimChilds, uid: string): AppLauncher => (target, componentFuncs, modifiersManager): IOsimNode => {
	const root: IOsimNode = new OsimComponentNode('root', uid, [], osmiumApp);
	root.compute(componentFuncs, modifiersManager);
	target.appendChild(root.dom);

	return root;
};
