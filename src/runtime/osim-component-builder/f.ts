import { IOsimChilds, IOsimNode } from '../runtime-interfaces';
import { OsimNode } from '../osim-node/OsimNode';

export default (childs: IOsimChilds = []): IOsimNode => {
	const dom = document.createDocumentFragment();
	const fONode = new OsimNode(dom);

	childs.forEach((child) => {
		fONode.addChild(child);
	});

	return fONode;
};
