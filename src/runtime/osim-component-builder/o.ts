import { IOsimNode, IComponentModifier, IRegisterToProps } from '../runtime-interfaces';

type Funcs = {
	[name: string]: (modifiers: IComponentModifier, registerToProp: IRegisterToProps) => void;
};

export default (osmiumApp: IOsimNode): ((componentFuncs: Funcs) => void) => (componentFuncs): void => {
	for (const compInOrder of osmiumApp.order) {
		const requestedProps = osmiumApp.requestedProps[compInOrder];
		const registerToProps: IRegisterToProps = requestedProps.reduce((acc, { attr, modifier }): IRegisterToProps => {
			const [compUid, modifierName] = modifier;
			acc[attr] = (func): number => osmiumApp.modifiers[compUid][modifierName].listeners.push(func);
			return acc;
		}, {});

		const componentFunction = componentFuncs[compInOrder.split('_')[0]];
		componentFunction(osmiumApp.modifiers[compInOrder], registerToProps);
	}
};
