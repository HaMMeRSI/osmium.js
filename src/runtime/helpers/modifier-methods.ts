import { IModifierActions, ModifierAction, IModifier, IOsmiumModifiers } from '../runtime-interfaces';
import { componentScopeDelimiter } from '../consts/delimiter';

function getModifier(actions: ModifierAction[]): IModifier {
	let value = '';
	let listeners = [];

	const execute = (modifierValue: string) => {
		if (modifierValue !== undefined) {
			value = modifierValue;
			actions.forEach((action): void => action(modifierValue));
			listeners.forEach((listner): void => listner());
		}

		return value;
	};

	execute.addListner = (func, getProps: () => {}) => {
		listeners.push(() => func(getProps()));
		return (): void => {
			listeners = listeners.filter((listner) => listner !== func);
		};
	};

	execute.addActions = (newActions: ModifierAction[]) => {
		const unregistrers = newActions.map((action) => {
			actions.push(action);
			action(value);

			return (): void => {
				actions = actions.filter((listner) => listner !== action);
			};
		});

		return (): void => {
			unregistrers.forEach((unregistrer) => unregistrer());
		};
	};

	return execute;
}

export const enhaceModifier = (modifierActions: IModifierActions, enhacedModifiers: IOsmiumModifiers): IOsmiumModifiers => {
	for (const [fullDynamicGetter, actions] of Object.entries(modifierActions)) {
		const [componentUid, modifierName]: string[] = fullDynamicGetter.split(componentScopeDelimiter);

		if (enhacedModifiers[componentUid]) {
			if (enhacedModifiers[componentUid][modifierName]) {
				enhacedModifiers[componentUid][modifierName].addActions(actions);
			} else {
				enhacedModifiers[componentUid][modifierName] = getModifier(actions);
			}
		} else {
			enhacedModifiers[componentUid] = {
				[modifierName]: getModifier(actions),
			};
		}
	}
	return enhacedModifiers;
};

export const initModifiers = (modifiers: string[], enhacedModifiers: IOsmiumModifiers): IOsmiumModifiers => {
	for (const fullModifierName of modifiers) {
		const [componentUid, modifierName]: string[] = fullModifierName.split(componentScopeDelimiter);

		if (enhacedModifiers[componentUid]) {
			enhacedModifiers[componentUid][modifierName] = getModifier([]);
		} else {
			enhacedModifiers[componentUid] = {
				[modifierName]: getModifier([]),
			};
		}
	}
	return enhacedModifiers;
};

export const createModifier = (modifiers: IModifierActions, modifier: string, modifierAction: ModifierAction) => {
	if (modifiers[modifier]) {
		modifiers[modifier].push(modifierAction);
	} else {
		modifiers[modifier] = [modifierAction];
	}
};
