import { IModifiers, ModifierAction } from '../../compiler-interfaces';

export const addModifier = (modifiers: IModifiers, modifierName: string, modifierAction: ModifierAction): void => {
	const [component, modifier]: string[] = modifierName.split('.');

	if (modifiers[component]) {
		modifiers[component][modifier] = [modifierAction];
	} else {
		modifiers[component] = {
			[modifier]: [modifierAction],
		};
	}
};
