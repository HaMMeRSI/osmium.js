/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentUid, IModifierManager, ModifierAction } from '../runtime-interfaces';
import { resolveObjectKey, getAccessorFromString } from './objectFunctions';
import { componentScopeDelimiter } from '../../common/consts';
interface ITeraidKeys {
	[key: string]: ITeraid;
}
type ITeraid = ITeraidKeys & {
	$actions: ModifierAction[];
	$listeners: (() => void)[];
};

function createBaseTeraid(): ITeraid {
	const teraid = Object.create(null);
	teraid.$actions = [];
	teraid.$listeners = [];

	return teraid;
}

function callAllEffects(model, effects: ITeraid) {
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

function initAllEffects(model, effects) {
	if (typeof model === 'object') {
		Object.entries(model).forEach(([key]: any) => {
			if (!(key in effects)) {
				effects[key] = createBaseTeraid();
			}

			initAllEffects(model[key], effects[key]);
		});
	}
}

function createProxer(model, effects) {
	return new Proxy(model, {
		get(_, prop: any) {
			if (!(prop in model)) {
				model[prop] = Object.create(null);
				if (!(prop in effects)) {
					effects[prop] = createBaseTeraid();
				}
			}

			if (typeof model[prop] === 'object') {
				return createProxer(model[prop], effects[prop]);
			}

			return model[prop];
		},
		set(_, prop: any, value) {
			model[prop] = value;

			if (prop in effects) {
				callAllEffects(model[prop], effects[prop]);
				initAllEffects(model[prop], effects[prop]);
			} else {
				effects[prop] = createBaseTeraid();
				initAllEffects(model[prop], effects[prop]);
			}

			return true;
		},
	});
}

export default (): IModifierManager => {
	// const modifierCollection: IOsmiumModifiers = new Map<string, IModifierInstance>();
	const modelCollection: Map<ComponentUid, Record<string, any>> = new Map<ComponentUid, Record<string, any>>();
	const effectsCollection: Map<ComponentUid, ITeraid> = new Map<ComponentUid, ITeraid>();
	const modifiers = new Proxy(Object.create(null), {
		get(_, prop: any) {
			if (!modelCollection.has(prop)) {
				effectsCollection.set(prop, Object.create(null));
				modelCollection.set(prop, Object.create(null));
			}

			return createProxer(modelCollection.get(prop), effectsCollection.get(prop));
		},
		set: () => false,
	});

	return {
		modifiers,
		getModifier(fullModifierName: string) {
			const [componentUid, path] = fullModifierName.replace(/[{}]/g, '').split(componentScopeDelimiter);
			return resolveObjectKey(path, modifiers[componentUid]);
		},
		addAction(fullModifierName: string, modifierAction: ModifierAction) {
			const [componentUid, path] = fullModifierName.split('_');
			if (!effectsCollection.has(componentUid)) {
				effectsCollection.set(componentUid, Object.create(null));
				modelCollection.set(componentUid, Object.create(null));
			}

			let currModel = modelCollection.get(componentUid);
			const properties = path.replace(/\[(\w+)\]/g, '.$1').split('.');
			const obj = properties.reduce((currEffect: ITeraid, key: string) => {
				if (!(key in currEffect)) {
					currEffect[key] = createBaseTeraid();
				}

				if (currModel) {
					currModel = currModel[key];
				}

				return currEffect[key];
			}, effectsCollection.get(componentUid));

			if (currModel) {
				modifierAction(currModel);
			}

			obj.$actions.push(modifierAction);
			return () => obj.$actions.splice(obj.$actions.indexOf(modifierAction), 1);
		},
		addListener(fullModifierName, func, getProps = () => null) {
			const [componentUid, path] = fullModifierName.split('_');
			if (!effectsCollection.has(componentUid)) {
				effectsCollection.set(componentUid, Object.create(null));
				modelCollection.set(componentUid, Object.create(null));
			}

			const properties = path.replace(/\[(\w+)\]/g, '.$1').split('.');
			let currModel = modelCollection.get(componentUid);
			const obj = properties.reduce((currEffect: ITeraid, key: string) => {
				if (!(key in currEffect)) {
					currEffect[key] = createBaseTeraid();
				}

				if (currModel) {
					currModel = currModel[key];
				}
				return currEffect[key];
			}, effectsCollection.get(componentUid)) as ITeraid;

			const listener = () => func(getProps());
			if (currModel) {
				listener();
			}
			obj.$listeners.push(listener);
			return () => obj.$listeners.splice(obj.$listeners.indexOf(listener), 1);
		},
		removeComponent(compinentUid: ComponentUid) {
			if (modelCollection.has(compinentUid)) {
				modelCollection.delete(compinentUid);
			}
		},
	};
};
