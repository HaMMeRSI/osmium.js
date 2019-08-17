import { IOsimChilds, IOsimNode } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';

export default (componentName: string, props, childs: IOsimChilds): IOsimNode => {
	return new OsimComponentNode(componentName, props, childs);
};
