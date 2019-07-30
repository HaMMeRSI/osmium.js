import { ModifierAction, IModifierF, IModifier, IModifierActions, IOsmiumModifiers } from '../runtime-interfaces';
import { componentScopeDelimiter } from '../../common/consts';

function getModifier(actions: ModifierAction[]): IModifierF {
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

	execute.addListener = (func, getProps: () => {}) => {
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

function createModifier(actions: ModifierAction[]): IModifier {
	const modifier = {
		value: '',
		listeners: [],
		actions,
	};

	return (new Proxy(modifier, {
		get(target, key) {
			if (key === 'addActions') {
				return (newActions: ModifierAction[]) => {
					const unregistrers = newActions.map((action) => {
						actions.push(action);
						action(target.value);

						return (): void => {
							actions = actions.filter((listner) => listner !== action);
						};
					});

					return (): void => {
						unregistrers.forEach((unregistrer) => unregistrer());
					};
				};
			} else if (key === 'addListener') {
				return (func, getProps: () => {}) => {
					target.listeners.push(() => func(getProps()));
					return (): void => {
						target.listeners = target.listeners.filter((listner) => listner !== func);
					};
				};
			} else {
				return modifier.value;
			}
		},
		set(target, key, value) {
			target.value = value;
			return true;
		},
	}) as unknown) as IModifier;
}

export const addActionsToModifiers = (modifierActions: IModifierActions, modifiers: IOsmiumModifiers): IOsmiumModifiers => {
	for (const [fullDynamicGetter, actions] of Object.entries(modifierActions)) {
		const [componentUid, modifierName]: string[] = fullDynamicGetter.split(componentScopeDelimiter);

		if (modifiers[componentUid]) {
			if (modifiers[componentUid][modifierName]) {
				modifiers[componentUid][modifierName].addActions(actions);
			} else {
				modifiers[componentUid][modifierName] = createModifier(actions);
			}
		} else {
			modifiers[componentUid] = {
				[modifierName]: createModifier(actions),
			};
		}
	}
	return modifiers;
};

export const bootstrapModifiers = (modifiersToBootstrap: string[], modifiers: IOsmiumModifiers): IOsmiumModifiers => {
	modifiersToBootstrap.forEach((fullModifierName) => {
		const [componentUid, modifierName]: string[] = fullModifierName.split(componentScopeDelimiter);

		if (modifiers[componentUid]) {
			modifiers[componentUid][modifierName] = createModifier([]);
		} else {
			modifiers[componentUid] = {
				[modifierName]: createModifier([]),
			};
		}
	});

	return modifiers;
};

export const addModifierAction = (modifierActions: IModifierActions, modifier: string, modifierAction: ModifierAction) => {
	if (modifierActions[modifier]) {
		modifierActions[modifier].push(modifierAction);
	} else {
		modifierActions[modifier] = [modifierAction];
	}
};
