import { IOsimChilds, IOsimNode } from '../runtime-interfaces';
import { OsimComponentNode } from '../osim-node/OsimComponentNode';
import { OsimNodeAttrs } from '../../common/interfaces';

export default (componentName: string, attrs: OsimNodeAttrs, childs: IOsimChilds): IOsimNode => {
	return new OsimComponentNode(componentName, attrs, childs);
};
