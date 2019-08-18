import { BaseOsimNode } from './BaseOsimNode';
import { IOsimChilds, IOsimNode } from '../runtime-interfaces';

export class OsimNode extends BaseOsimNode {
	public constructor(dom: Element | Text, childs?: IOsimChilds) {
		super(dom);
		this.addRemover(() => {
			dom.remove();
		});

		if (childs) {
			childs.forEach((child) => {
				this.addChild(child);
			});
		}
	}

	public addChild(childONode: IOsimNode) {
		super.addChild(childONode);
		this.dom.appendChild(childONode.dom);
	}
}
