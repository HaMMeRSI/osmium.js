import { matchDynamicGetterName } from '../consts/regexes';
import { RegisterToProps } from '../runtime-interfaces';
import { componentScopeDelimiter } from '../../common/consts';
import { BaseOsimNode } from './BaseOsimNode';

export class OsimComponentNode extends BaseOsimNode {
	public uid;
	public componentName;
	public props;

	public constructor(componentName, props) {
		super(document.createDocumentFragment());
		const [, uid] = props.find(([name]): boolean => name.startsWith('osim'));
		this.uid = uid;
		this.componentName = componentName;
		this.props = props;
		this.oNode.order.push({
			componentName,
			uid,
		});
		this.oNode.requestedProps = props.reduce((requestedProps, [name, value]) => {
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
	}

	public compute(componentFuncs, modifiersManager) {
		super.compute(componentFuncs, modifiersManager);

		for (const { uid, componentName } of this.oNode.order) {
			const requestedProps = this.oNode.requestedProps[uid];
			const rgisterPropsChange: RegisterToProps = (f): void => {
				const getProps = () => {
					const props = {};
					for (const { attr, modifier } of Object.values(requestedProps)) {
						const [modiferComponentUid, modifierName] = modifier.split(componentScopeDelimiter);
						props[attr] = modifiersManager.modifiers.get(modiferComponentUid)[modifierName];
					}
					return props;
				};
				for (const { modifier } of Object.values(requestedProps)) {
					modifiersManager.addListener(modifier, f, getProps);
				}
				f(getProps());
			};

			const componentFunction = componentFuncs[componentName];
			componentFunction(modifiersManager.modifiers[uid], rgisterPropsChange);
		}
	}

	public addChild(childONode) {
		super.addChild(childONode);
		this.oNode.dom.appendChild(childONode.oNode.dom);
	}
}
