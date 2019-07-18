import { IOsimNode, RegisterToProps, IOsmiumComponentModifiers, IOsmiumModifiers } from '../runtime-interfaces';
import { enhaceModifier } from '../helpers/addModifier';

type Funcs = {
	[name: string]: (modifiers: IOsmiumComponentModifiers, registerToProps: RegisterToProps) => void;
};

export default (buildOsmiumApp: (dom) => IOsimNode): ((target: HTMLElement, componentFuncs: Funcs) => Node) => (target, componentFuncs): Node => {
	const osmiumApp = buildOsmiumApp(target);
	osmiumApp.order.splice(0, 0, 'root');
	const modifiers: IOsmiumModifiers = {};
	enhaceModifier(osmiumApp.modifiersActions, modifiers);

	for (const builtin of osmiumApp.builtins) {
		const modifiersForBuiltin = builtin.usedModifiers.reduce((acc, curr) => {
			const [uid, action] = curr.split('.');
			acc[action] = modifiers[uid][action];
			return acc;
		}, {});
		for (const requestedModifier of builtin.usedModifiers) {
			const [uid, action] = requestedModifier.split('.');
			modifiers[uid][action].addListner(
				() => {
					const evaluatedONode = builtin.evaluationFunction(modifiersForBuiltin);
					enhaceModifier(evaluatedONode.modifiersActions, modifiers);
				},
				() => {
					return null;
				}
			);
		}
	}

	for (const compInOrder of osmiumApp.order) {
		const requestedProps = osmiumApp.requestedProps[compInOrder];
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

	return osmiumApp.dom;
};
