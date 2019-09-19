import { ComponentFuncs, IModifierManager } from './../runtime-interfaces';
import { BaseOsimNode } from './BaseOsimNode';
import { IOsimNode } from '../runtime-interfaces';

type CalculateBuiltin = (oNode: IOsimNode) => void;

export class OsimBuiltinNode extends BaseOsimNode {
	public uid: string;
	public isEvaluated;
	private usedScopedModifierNames: string[];
	private calculateBuiltin: CalculateBuiltin;

	public constructor(uid: string, usedScopedModifierNames: string[], calculateBuiltin: CalculateBuiltin) {
		super(document.createComment(uid));
		this.addRemover(() => {
			(this.dom as Element).remove();
		});

		this.uid = uid;
		this.usedScopedModifierNames = usedScopedModifierNames;
		this.calculateBuiltin = calculateBuiltin;
		this.isEvaluated = false;
	}

	public addChild(childOnode: IOsimNode) {
		super.addChild(childOnode);
		this.dom.parentNode.insertBefore(childOnode.dom, this.dom);
	}

	public compute(componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) {
		super.compute(componentFuncs, modifiersManager);
		for (const requestedModifier of this.usedScopedModifierNames) {
			this.addRemover(modifiersManager.addListener(requestedModifier, () => this.calculateBuiltin(this)));
		}
	}
}
