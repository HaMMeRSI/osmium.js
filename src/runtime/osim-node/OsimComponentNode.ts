import { ComponentFuncs, IComponentFuncEvents } from '../runtime-interfaces';
import { matchModifierName } from '../consts/regexes';
import { IOsimChilds, IOsimNode, IModifierManager } from '../runtime-interfaces';
import { BaseOsimNode } from './BaseOsimNode';
import { OsimNodeAttrs } from '../../common/interfaces';
import { OSIM_UID } from '../../compiler/template/consts';

export class OsimComponentNode extends BaseOsimNode {
	public uid: string;
	public componentName: string;
	public requestedProps: string[][];
	private dispose: () => void;
	private emptyResult: IComponentFuncEvents;

	public constructor(componentName: string, attrs: OsimNodeAttrs, childs: IOsimChilds) {
		super(document.createDocumentFragment());
		this.emptyResult = {
			dispose: () => {},
			update: () => {},
		};
		this.uid = attrs.find(([name]): boolean => name === OSIM_UID)[1];
		this.componentName = componentName;
		this.requestedProps = (attrs || [])
			.filter(([name, value]) => !name.startsWith('osim') && value.match(matchModifierName))
			.map(([name, value]) => {
				const scopedModifierName = value.match(matchModifierName)[0].split('.')[0];
				return [name, scopedModifierName];
			});

		childs.forEach(this.addChild.bind(this));
	}

	public compute(componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) {
		const componentFunction = componentFuncs[this.componentName];

		this.childrens.forEach((childONode: IOsimNode) => {
			childONode.compute(componentFuncs, modifiersManager);
		});
		const { update, dispose } = componentFunction(modifiersManager.modifiers[this.uid]) || this.emptyResult;
		this.dispose = dispose;
		this.requestedProps.forEach(([, scopedModifierName]) => {
			this.addRemover(
				modifiersManager.addListener(scopedModifierName, () => {
					const props = this.requestedProps.reduce((acc, [propName, scopedModifierName]): unknown => {
						acc[propName] = modifiersManager.getModifier(scopedModifierName);
						return acc;
					}, {});

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
