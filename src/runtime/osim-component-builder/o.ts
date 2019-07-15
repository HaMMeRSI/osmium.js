import { IOsimNode, RegisterToProps, IOsmiumComponentModifiers } from '../runtime-interfaces';
import { enhaceModifier } from '../helpers/addModifier';

type Funcs = {
	[name: string]: (modifiers: IOsmiumComponentModifiers, registerToProps: RegisterToProps) => void;
};

export default (osmiumApp: IOsimNode): ((componentFuncs: Funcs) => Node) => (componentFuncs): Node => {
	osmiumApp.order.splice(0, 0, 'root');
	const modifiers = enhaceModifier(osmiumApp.modifiersActions);

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
