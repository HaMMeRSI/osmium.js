import { ComponentFuncs, IModifierManager } from './../runtime-interfaces';
import { BaseOsimNode } from './BaseOsimNode';
import { IOsimNode } from '../runtime-interfaces';

export class OsimBuiltinNode extends BaseOsimNode {
	public uid: string;
	public isEvaluated;
	private usedModifiers: string[];
	private calculateBuiltin: (oNode: IOsimNode) => void;
	public constructor(uid: string, usedModifiers: string[], calculateBuiltin) {
		super(document.createComment(uid));
		this.addRemover(() => {
			(this.dom as Element).remove();
		});

		this.uid = uid;
		this.usedModifiers = usedModifiers.map((modifier) => modifier.replace(/[{}]/g, ''));
		this.calculateBuiltin = calculateBuiltin;
		this.isEvaluated = false;
	}

	public addChild(childOnode: IOsimNode) {
		super.addChild(childOnode);
		this.dom.parentNode.insertBefore(childOnode.dom, this.dom);
	}

	public compute(componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) {
		super.compute(componentFuncs, modifiersManager);
		for (const requestedModifier of this.usedModifiers) {
			this.addRemover(modifiersManager.addListener(requestedModifier, () => this.calculateBuiltin(this)));
		}
	}
}
