import { IOsimNode, IOsimNodeData, ComponentFuncs, IModifierManager } from '../runtime-interfaces';

export class BaseOsimNode implements IOsimNode {
	public oNode: IOsimNodeData;
	protected childrens: IOsimNode[];

	public constructor(dom: Node) {
		this.oNode = {
			dom,
			order: [],
			removers: [],
			requestedProps: {},
		};

		this.childrens = [];
	}

	public addChild(childONode) {
		this.childrens.push(childONode);
	}

	public addRemover(remover) {
		this.oNode.removers.push(remover);
	}

	public remove() {
		this.childrens.forEach((child) => child.remove());
		this.oNode.removers.forEach((remover) => remover());
	}

	public removeChilds() {
		this.childrens.forEach((child) => child.remove());
	}

	public compute(componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) {
		this.childrens.forEach((childONode: IOsimNode) => {
			childONode.compute(componentFuncs, modifiersManager);
		});
	}
}
