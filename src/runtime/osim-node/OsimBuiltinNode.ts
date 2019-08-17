import { BaseOsimNode } from './BaseOsimNode';
import { IOsimNode } from '../runtime-interfaces';

export class OsimBuiltinNode extends BaseOsimNode {
	private uid: string;
	private usedModifiers: string[];
	private calculateBuiltin: (oNode: IOsimNode) => void;

	public constructor(uid, usedModifiers, calculateBuiltin) {
		super(document.createComment(uid));
		this.addRemover(() => {
			(this.oNode.dom as Element).remove();
		});

		this.uid = uid;
		this.usedModifiers = usedModifiers;
		this.calculateBuiltin = calculateBuiltin;
	}

	public addChild(childOnode) {
		super.addChild(childOnode);
		this.oNode.dom.parentNode.insertBefore(childOnode.oNode.dom, this.oNode.dom);
	}

	public compute(componentFuncs, modifiersManager) {
		super.compute(componentFuncs, modifiersManager);
		for (const requestedModifier of this.usedModifiers) {
			this.addRemover(modifiersManager.addListener(requestedModifier, () => this.calculateBuiltin(this)));
		}
	}
}
