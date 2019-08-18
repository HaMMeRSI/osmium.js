import { IOsimChilds, IOsimNode } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';
import { OsimNodeProps } from '../../common/interfaces';

export default (componentName: string, props: OsimNodeProps, childs: IOsimChilds): IOsimNode => {
	return new OsimComponentNode(componentName, props, childs);
};
