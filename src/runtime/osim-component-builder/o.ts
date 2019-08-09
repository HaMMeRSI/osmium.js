import { IOsimNode, RegisterToProps, IOsmiumComponentModifiers, IModifierManager } from '../runtime-interfaces';
import { componentScopeDelimiter } from '../../common/consts';

type Funcs = {
	[name: string]: (modifiers: IOsmiumComponentModifiers, registerToProps: RegisterToProps) => void;
};
type AppLauncher = (target: HTMLElement, componentFuncs: Funcs, modifiersManager: IModifierManager) => Node;
export default (osmiumApp: IOsimNode): AppLauncher => (target, componentFuncs, modifiersManager): Node => {
	const computeOsimNode = (osmiumNode: IOsimNode) => {
		for (const { uid, componentName } of osmiumNode.order) {
			const requestedProps = osmiumNode.requestedProps[uid];
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

		for (const builtin of osmiumNode.builtins) {
			function evaluateBuiltin() {
				const oNode: IOsimNode = builtin.evaluationFunction(modifiersManager, modifiersManager.modifiers);
				if (oNode) {
					computeOsimNode(oNode);
				}
			}
			evaluateBuiltin();

			for (const requestedModifier of builtin.builtinData.usedModifiers) {
				modifiersManager.addListener(requestedModifier, evaluateBuiltin);
			}
		}
	};

	osmiumApp.order.splice(0, 0, { uid: 'root', componentName: 'root' });
	// modifiersManager.addModifiers(modifierNamesByScope.global);
	// modifiersManager.addActions(osmiumApp.modifiersActions);
	computeOsimNode(osmiumApp);
	target.appendChild(osmiumApp.dom);

	return osmiumApp.dom;
};
