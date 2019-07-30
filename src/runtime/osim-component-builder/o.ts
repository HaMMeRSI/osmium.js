import { IOsimNode, RegisterToProps, IOsmiumComponentModifiers } from '../runtime-interfaces';
import { createModifiersManager } from '../helpers/modifier-manager';
import { componentScopeDelimiter } from '../../common/consts';
import { IModifierNamesByScopeObjectified } from '../../common/interfaces';

type Funcs = {
	[name: string]: (modifiers: IOsmiumComponentModifiers, registerToProps: RegisterToProps) => void;
};

export default (
	osmiumApp: IOsimNode
): ((target: HTMLElement, componentFuncs: Funcs, modifierNamesByScope: IModifierNamesByScopeObjectified) => Node) => (
	target,
	componentFuncs,
	modifierNamesByScope
): Node => {
	const modifiersManager = createModifiersManager();

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
			componentFunction(modifiersManager.modifiers.get(uid), rgisterPropsChange);
		}

		for (const builtin of osmiumNode.builtins) {
			const evaluationFunction = () => {
				const evaluatedBuiltinFunc = builtin.evaluationFunction(modifiersManager.modifiers);

				if (evaluatedBuiltinFunc === null) {
					new Set(
						modifierNamesByScope[builtin.uid].map((modifier) => modifier.split(componentScopeDelimiter)[0])
					).forEach((componentUid) => {
						if (modifiersManager.modifiers.has(componentUid)) {
							modifiersManager.removeComponent(componentUid);
						}
					});
				} else {
					modifiersManager.addModifiers(modifierNamesByScope[builtin.uid]);
					const osimBuiltinNode = evaluatedBuiltinFunc(modifiersManager);
					modifiersManager.addActions(osimBuiltinNode.modifiersActions);
					computeOsimNode(osimBuiltinNode);
				}
			};
			evaluationFunction();

			for (const requestedModifier of builtin.usedModifiers) {
				modifiersManager.addListener(requestedModifier, evaluationFunction);
			}
		}
	};

	osmiumApp.order.splice(0, 0, { uid: 'root', componentName: 'root' });
	modifiersManager.addModifiers(modifierNamesByScope.all);
	modifiersManager.addActions(osmiumApp.modifiersActions);
	computeOsimNode(osmiumApp);
	target.appendChild(osmiumApp.dom);

	return osmiumApp.dom;
};
