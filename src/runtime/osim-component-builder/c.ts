import { IOsimChilds, IOsimNode } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';

export default (componentName: string, props, childs: IOsimChilds): IOsimNode => {
	const cONode = new OsimComponentNode(componentName, props);
	childs.forEach((child) => {
		cONode.addChild(child);
	});

	return cONode;
};
