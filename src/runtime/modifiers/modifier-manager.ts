/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentUid, IModifierManager, ModifierAction } from '../runtime-interfaces';
import { resolveObjectKey } from '../helpers/objectFunctions';
import { componentScopeDelimiter } from '../../common/consts';
import { createProxer } from './proxer';
import { IEffect, createBaseEffect } from './effects';

export default (): IModifierManager => {
	const modelCollection: Map<ComponentUid, Record<string, any>> = new Map<ComponentUid, Record<string, any>>();
	const effectsCollection: Map<ComponentUid, IEffect> = new Map<ComponentUid, IEffect>();
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
		getModifier(scopedModifierAccessorName: string) {
			const [componentUid, modifierAccessorName] = scopedModifierAccessorName.split(componentScopeDelimiter);
			return resolveObjectKey(modifierAccessorName, modifiers[componentUid]);
		},
		addAction(modifierName: string, modifierAction: ModifierAction) {
			const [componentUid, modifierAccessorName] = modifierName.split('_');
			let currModel = modelCollection.get(componentUid);

			if (!effectsCollection.has(componentUid)) {
				effectsCollection.set(componentUid, Object.create(null));
				modelCollection.set(componentUid, Object.create(null));
			}

			const properties = modifierAccessorName.replace(/\[(.+)\]/g, '.$1').split('.');
			const effect = properties.reduce((currEffect: IEffect, key: string) => {
				if (!(key in currEffect)) {
					currEffect[key] = createBaseEffect();
				}

				if (currModel) {
					currModel = currModel[key];
				}

				return currEffect[key];
			}, effectsCollection.get(componentUid));

			if (currModel !== undefined) {
				modifierAction(currModel);
			}

			effect.$actions.push(modifierAction);
			return () => effect.$actions.splice(effect.$actions.indexOf(modifierAction), 1);
		},
		addListener(modifierName, func) {
			const [componentUid, modifierAccessorName] = modifierName.split('_');
			let currModel = modelCollection.get(componentUid);

			if (!effectsCollection.has(componentUid)) {
				effectsCollection.set(componentUid, Object.create(null));
				modelCollection.set(componentUid, Object.create(null));
			}

			const properties = modifierAccessorName.replace(/\[(.+)\]/g, '.$1').split('.');
			const effect = properties.reduce((currEffect: IEffect, key: string) => {
				if (!(key in currEffect)) {
					currEffect[key] = createBaseEffect();
				}

				if (currModel) {
					currModel = currModel[key];
				}
				return currEffect[key];
			}, effectsCollection.get(componentUid)) as IEffect;

			if (currModel !== undefined) {
				func();
			}
			effect.$listeners.push(func);
			return () => effect.$listeners.splice(effect.$listeners.indexOf(func), 1);
		},
		removeComponent(compinentUid: ComponentUid) {
			if (modelCollection.has(compinentUid)) {
				modelCollection.delete(compinentUid);
			}
			if (effectsCollection.has(compinentUid)) {
				effectsCollection.delete(compinentUid);
			}
		},
	};
};
