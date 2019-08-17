import { BaseOsimNode } from './BaseOsimNode';
import { IOsimChilds } from '../runtime-interfaces';

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

	public addChild(childONode) {
		super.addChild(childONode);
		this.oNode.dom.appendChild(childONode.oNode.dom);
	}
}
