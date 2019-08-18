import { ComponentFuncs } from './../runtime-interfaces';
import { matchDynamicGetterName } from '../consts/regexes';
import { RegisterToProps, IOsimChilds, IOsimNode, IModifierManager, IRequestedProps } from '../runtime-interfaces';
import { componentScopeDelimiter } from '../../common/consts';
import { BaseOsimNode } from './BaseOsimNode';
import { OsimNodeProps } from '../../common/interfaces';

export class OsimComponentNode extends BaseOsimNode {
	public uid: string;
	public componentName: string;
	public props: OsimNodeProps;
	public requestedProps: IRequestedProps;

	public constructor(componentName: string, props: OsimNodeProps, childs: IOsimChilds) {
		super(document.createDocumentFragment());
		const [, uid] = props.find(([name]): boolean => name.startsWith('osim'));
		this.uid = uid;
		this.componentName = componentName;
		this.props = props;
		this.requestedProps = props.reduce((requestedProps, [name, value]) => {
			const dynamicGetter = value.match(matchDynamicGetterName);
			if (dynamicGetter) {
				const requestedProp = {
					attr: name,
					modifier: dynamicGetter[0].split('.')[0],
				};
				if (uid in requestedProps) {
					requestedProps[uid].push(requestedProp);
				} else {
					requestedProps[uid] = [requestedProp];
				}
			}
			return requestedProps;
		}, {});

		childs.forEach((child) => {
			this.addChild(child);
		});
	}

	public compute(componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) {
		const requestedProps = this.requestedProps[this.uid];
		const rgisterPropsChange: RegisterToProps = (f): void => {
			const getProps = () => {
				const props = {};
				for (const { attr, modifier } of Object.values(requestedProps)) {
					const [modiferComponentUid, modifierName] = modifier.split(componentScopeDelimiter);
					props[attr] = modifiersManager.modifiers[modiferComponentUid][modifierName];
				}
				return props;
			};
			for (const { modifier } of Object.values(requestedProps)) {
				modifiersManager.addListener(modifier, f, getProps);
			}
			f(getProps());
		};

		const componentFunction = componentFuncs[this.componentName];
		componentFunction(modifiersManager.modifiers[this.uid], rgisterPropsChange);

		this.childrens.forEach((childONode: IOsimNode) => {
			childONode.compute(componentFuncs, modifiersManager);
		});
	}

	public addChild(childONode: IOsimNode) {
		super.addChild(childONode);
		this.dom.appendChild(childONode.dom);
	}
}
