import { IOsimNode, RegisterToProps, IOsmiumComponentModifiers, IOsmiumModifiers } from '../runtime-interfaces';
import { enhaceModifier, initModifiers } from '../helpers/modifier-methods';

type Funcs = {
	[name: string]: (modifiers: IOsmiumComponentModifiers, registerToProps: RegisterToProps) => void;
};

function computeOsimNode(osmiumNode: IOsimNode, componentFuncs: Funcs, modifiers: IOsmiumModifiers) {
	for (const compInOrder of osmiumNode.order) {
		const requestedProps = osmiumNode.requestedProps[compInOrder];
		const rgisterPropsChange: RegisterToProps = (f): void => {
			const getProps = () => {
				const props = {};
				for (const { attr, modifier } of Object.values(requestedProps)) {
					const [modiferComponentUid, modifierName] = modifier.split('.');
					props[attr] = modifiers[modiferComponentUid][modifierName]();
				}

				return props;
			};

			for (const { modifier } of Object.values(requestedProps)) {
				const [modiferComponentUid, modifierName] = modifier.split('.');
				modifiers[modiferComponentUid][modifierName].addListner(f, getProps);
			}

			f(getProps());
		};

		const componentFunction = componentFuncs[compInOrder.split('_')[0]];
		componentFunction(modifiers[compInOrder], rgisterPropsChange);
	}

	for (const builtin of osmiumNode.builtins) {
		const evaluationFunction = () => {
			const osimBuiltinNode = builtin.evaluationFunction(modifiers);
			computeOsimNode(osimBuiltinNode, componentFuncs, modifiers);
		};
		evaluationFunction();

		for (const requestedModifier of builtin.usedModifiers) {
			const [uid, action] = requestedModifier.split('.');
			modifiers[uid][action].addListner(evaluationFunction, () => null);
		}
	}
}

export default (osmiumApp: IOsimNode): ((target: HTMLElement, componentFuncs: Funcs, allModifiers: string[]) => Node) => (target, componentFuncs, allModifiers): Node => {
	target.appendChild(osmiumApp.dom);
	osmiumApp.order.splice(0, 0, 'root');
	const modifiers: IOsmiumModifiers = {};
	initModifiers(allModifiers, modifiers);

	enhaceModifier(osmiumApp.modifiersActions, modifiers);
	computeOsimNode(osmiumApp, componentFuncs, modifiers);

	return osmiumApp.dom;
};
