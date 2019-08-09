/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentUid, IModifierManager, ModifierAction } from '../runtime-interfaces';
import { componentScopeDelimiter } from '../../common/consts';
import { resolveObjectKey } from './objectFunctions';
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
	Object.entries(model).forEach(([key, value]: any) => {
		effects[key] = createBaseTeraid();
		initAllEffects(model[key], value);
	});
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
	const modelCollection: Map<ComponentUid, any> = new Map<ComponentUid, any>();
	const effectsCollection: Map<ComponentUid, any> = new Map<ComponentUid, any>();

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
			const obj = properties.reduce((acc: ITeraid, curr: string) => {
				if (!(curr in acc)) {
					acc[curr] = createBaseTeraid();
				}

				if (currModel && curr in currModel) {
					currModel = currModel[curr];
				} else {
					currModel = null;
				}

				return acc[curr];
			}, effectsCollection.get(componentUid)) as ITeraid;

			if (currModel) {
				modifierAction(currModel);
			}
			obj.$actions.push(modifierAction);
			return () => obj.$actions.splice(obj.$actions.indexOf(modifierAction), 1);
		},
		addListener(fullModifierName, func, getProps = () => null) {
			const [componentUid, path] = fullModifierName.split('_');
			const properties = path.replace(/\[(\w+)\]/g, '.$1').split('.');
			const obj = properties.reduce((acc: ITeraid, curr: string) => {
				if (!(curr in acc)) {
					acc[curr] = createBaseTeraid();
				}

				return acc[curr];
			}, effectsCollection.get(componentUid)) as ITeraid;

			const listener = () => func(getProps());
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
