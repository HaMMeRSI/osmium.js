import { IOsimModifiers, ModifierAction } from '../runtime-interfaces';

export const addModifier = (modifiers: IOsimModifiers, modifierName: string, modifierAction: ModifierAction): void => {
	const [component, modifier]: string[] = modifierName.split('.');

	if (modifiers[component]) {
		modifiers[component][modifier] = {
			listeners: [],
			modifierAction,
		};
	} else {
		modifiers[component] = {
			[modifier]: {
				listeners: [],
				modifierAction,
			},
		};
	}
};
