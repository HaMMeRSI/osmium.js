/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentUid, IModifierManager, ModifierAction } from '../runtime-interfaces';
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

function callAllEffects(model, effects) {
	Object.entries(effects).forEach(([key, value]: any) => {
		if (key === '$actions') {
			value.forEach((action) => action(model));
		} else if (key === '$listeners') {
			value.forEach((listener) => listener());
		} else {
			callAllEffects(model[key], value);
		}
	});
}

function initAllEffects(model, effects) {
	if (typeof model === 'object') {
		Object.entries(model).forEach(([key, value]: any) => {
			effects[key] = createBaseTeraid();
			initAllEffects(model[key], value);
		});
	}
}

function createProxer(model, effects) {
	return new Proxy(model, {
		get(target, prop: any) {
			if (!(prop in target)) {
				target[prop] = Object.create(null);
				effects[prop] = createBaseTeraid();
			}

			if (typeof target[prop] === 'object') {
				return createProxer(target[prop], effects[prop]);
			}

			return target[prop];
		},
		set(target, prop: any, value) {
			target[prop] = value;

			if (prop in effects) {
				callAllEffects(target[prop], effects[prop]);
			} else {
				effects[prop] = createBaseTeraid();
				initAllEffects(value, effects[prop]);
			}

			return true;
		},
	});
}

export default (): IModifierManager => {
	// const modifierCollection: IOsmiumModifiers = new Map<string, IModifierInstance>();
	const modelCollection: Map<ComponentUid, Record<string, any>> = new Map<ComponentUid, Record<string, any>>();
	const effectsCollection: Map<ComponentUid, ITeraid> = new Map<ComponentUid, ITeraid>();

	return {
		modifiers: new Proxy(Object.create(null), {
			get(_, prop: any) {
				return createProxer(modelCollection.get(prop), effectsCollection.get(prop));
			},
			set: () => false,
		}),
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
