import { BaseOsimNode } from './BaseOsimNode';

export class OsimNode extends BaseOsimNode {
	public constructor(dom: Node) {
		super(dom);
		this.addRemover(() => {
			(dom as Element).remove();
		});
	}

	public addChild(childONode) {
		super.addChild(childONode);
		this.oNode.dom.appendChild(childONode.oNode.dom);
	}
}
