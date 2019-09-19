import { ModifierAction } from '../runtime-interfaces';

interface IEffectKeys {
	[key: string]: IEffect;
}
export type IEffect = IEffectKeys & {
	$actions: ModifierAction[];
	$listeners: (() => void)[];
};
export function createBaseEffect(): IEffect {
	const effect = Object.create(null);
	effect.$actions = [];
	effect.$listeners = [];

	return effect;
}
export function callAllEffects(model, effects: IEffect) {
	Object.entries(effects).forEach(([key, effectTree]: any) => {
		if (key === '$actions') {
			effectTree.forEach((action) => action(model));
		} else if (key === '$listeners') {
			effectTree.forEach((listener) => listener());
		} else {
			callAllEffects(model[key], effectTree);
		}
	});
}

export function initAllEffects(model, effects) {
	if (typeof model === 'object') {
		Object.keys(model).forEach((key) => {
			if (!(key in effects)) {
				effects[key] = createBaseEffect();
			}

			initAllEffects(model[key], effects[key]);
		});
	}
}
