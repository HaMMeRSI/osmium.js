import { BaseOsimNode } from './BaseOsimNode';
import { EvaluationFunction } from '../runtime-interfaces';

export class OsimBuiltinNode extends BaseOsimNode {
	private uid: string;
	private usedModifiers: string[];
	private builtinFunction: EvaluationFunction;

	public constructor(uid, usedModifiers, builtinFunction) {
		super(document.createComment('ph'));
		this.addRemover(() => {
			(this.oNode.dom as Element).remove();
		});

		this.uid = uid;
		this.usedModifiers = usedModifiers;
		this.builtinFunction = builtinFunction;
	}

	public addChild(childOnode) {
		super.addChild(childOnode);
		this.oNode.dom.parentNode.insertBefore(childOnode.oNode.dom, this.oNode.dom);
	}

	public compute(componentFuncs, modifiersManager) {
		super.compute(componentFuncs, modifiersManager);
		const calculateBuiltin = () => {
			const evaluatedONodes = this.builtinFunction(modifiersManager.modifiers);

			if (evaluatedONodes === null) {
				this.removeChilds();
				modifiersManager.removeComponent(this.uid);
			} else {
				evaluatedONodes.forEach((child) => {
					this.addChild(child);
					child.compute(componentFuncs, modifiersManager);
				});
			}
		};

		for (const requestedModifier of this.usedModifiers) {
			this.addRemover(modifiersManager.addListener(requestedModifier, calculateBuiltin));
		}
	}
}
