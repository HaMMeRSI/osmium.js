import { IOsimNode, ComponentFuncs, IModifierManager } from '../runtime-interfaces';

export class BaseOsimNode implements IOsimNode {
	public dom: Node;
	public removers: (() => void)[];
	protected childrens: IOsimNode[];

	public constructor(dom: Node) {
		this.dom = dom;
		this.removers = [];
		this.childrens = [];
	}

	public addChild(childONode: IOsimNode) {
		this.childrens.push(childONode);
	}

	public addRemover(remover: () => void) {
		this.removers.push(remover);
	}

	public remove() {
		this.removeChilds();
		this.removers.forEach((remover) => remover());
	}

	public removeChilds() {
		this.childrens.forEach((child) => child.remove());
		this.childrens = [];
	}

	public compute(componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) {
		this.childrens.forEach((childONode: IOsimNode) => {
			childONode.compute(componentFuncs, modifiersManager);
		});
	}
}
