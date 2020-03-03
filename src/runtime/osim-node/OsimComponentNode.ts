import { ComponentFuncs, IComponentFuncEvents } from '../runtime-interfaces';
import { matchModifierName } from '../consts/regexes';
import { IOsimChilds, IOsimNode, IModifierManager } from '../runtime-interfaces';
import { BaseOsimNode } from './BaseOsimNode';
import { OsimNodeAttrs } from '../../common/interfaces';
import { splitObjectAccessor } from '../helpers/objectFunctions';

export class OsimComponentNode extends BaseOsimNode {
	public uid: string;
	public componentName: string;
	public requestedProps: string[][];
	private dispose: () => void;
	private emptyResult: IComponentFuncEvents;

	public constructor(componentName: string, uid: string, attrs: OsimNodeAttrs, childs: IOsimChilds) {
		super(document.createDocumentFragment());
		this.emptyResult = {
			dispose: () => {},
			update: () => {},
		};
		this.uid = uid;
		this.componentName = componentName;
		this.requestedProps = (attrs || [])
			.filter(([name, value]) => !name.startsWith('osim') && matchModifierName.test(value))
			.map(([name, value]) => [name, splitObjectAccessor(value.match(matchModifierName)[0])[0]]);

		childs.forEach(this.addChild.bind(this));
	}

	public compute(componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) {
		const componentFunction = componentFuncs[this.componentName];

		this.childrens.forEach((childONode: IOsimNode) => {
			childONode.compute(componentFuncs, modifiersManager);
		});
		const { update, dispose } = Object.assign({}, this.emptyResult, componentFunction(modifiersManager.modifiers[this.uid]));
		this.dispose = dispose;
		this.requestedProps.forEach(([, scopedModifierName]) => {
			this.addRemover(
				modifiersManager.addListener(scopedModifierName, () => {
					const props = this.requestedProps.reduce(
						(acc, [propName, cScopedModifierName]) => Object.assign({}, acc, { [propName]: modifiersManager.getModel(cScopedModifierName) }),
						{}
					);

					update(props);
				})
			);
		});
	}

	public addChild(childONode: IOsimNode) {
		super.addChild(childONode);
		this.dom.appendChild(childONode.dom);
	}

	public remove() {
		super.remove();
		this.dispose();
	}
}
