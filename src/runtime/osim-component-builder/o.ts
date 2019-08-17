import { IModifierManager, ComponentFuncs, IOsimNode } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';

type AppLauncher = (target: HTMLElement, componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => IOsimNode;

export default (osmiumApp: IOsimNode): AppLauncher => (target, componentFuncs, modifiersManager): IOsimNode => {
	const root: IOsimNode = new OsimComponentNode('root', [['osim:uid', 'root']]);
	root.addChild(osmiumApp);
	root.compute(componentFuncs, modifiersManager);
	target.appendChild(root.oNode.dom);

	return osmiumApp;
};
