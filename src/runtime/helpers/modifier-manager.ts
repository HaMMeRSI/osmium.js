/* eslint-disable @typescript-eslint/no-explicit-any */
import { IModifierActions, IOsmiumModifiers, IModifierInstance, ComponentUid, IModifierManager } from '../runtime-interfaces';
import { componentScopeDelimiter } from '../../common/consts';

export const createModifiersManager = (): IModifierManager => {
	const modifierCollection: IOsmiumModifiers = new Map<string, IModifierInstance>();
	const proxyCollection: Map<ComponentUid, any> = new Map<ComponentUid, any>();

	function createModifierObjectProxy(modifier: IModifierInstance, modifierObject: any) {
		return new Proxy(modifierObject, {
			get(target, prop: any) {
				const objectValue = target[prop];
				if (typeof objectValue === 'object') {
					return createModifierObjectProxy(modifier, objectValue);
				}

				return objectValue;
			},
			set(target, prop: any, value) {
				target[prop] = value;
				modifier.value = value;
				modifier.actions.forEach((action) => action(value));
				modifier.listeners.forEach((listner) => listner());
				return true;
			},
		});
	}

	function createComponentModifierProxy(componentUid: ComponentUid): any {
		const obj: { [componentUid: string]: IModifierInstance } = {};
		return new Proxy(obj, {
			get(_, prop: any) {
				const modifierFullName = `${componentUid}${componentScopeDelimiter}${String(prop)}`;
				if (modifierCollection.has(modifierFullName)) {
					const modifier = modifierCollection.get(modifierFullName);

					if (typeof modifier.value === 'object') {
						return createModifierObjectProxy(modifier, modifier.value);
					}

					return modifier.value;
				}

				throw new Error(`modifier: ${String(prop)} does not exsists`);
			},
			set(_, prop: any, value) {
				const modifierFullName = `${componentUid}${componentScopeDelimiter}${String(prop)}`;

				if (modifierCollection.has(modifierFullName)) {
					const modifier = modifierCollection.get(modifierFullName);
					modifier.value = value;
					modifier.actions.forEach((action) => action(value));
					modifier.listeners.forEach((listner) => listner());
					return true;
				}

				throw new Error(`modifier: ${String(prop)} does not exsists`);
			},
		});
	}

	return {
		modifiers: proxyCollection,
		addModifiers(modifierNames: string[]) {
			modifierNames.forEach((fullModifierName) => {
				const [componentUid]: string[] = fullModifierName.split(componentScopeDelimiter);
				if (!proxyCollection.has(componentUid)) {
					proxyCollection.set(componentUid, createComponentModifierProxy(componentUid));
				}
				modifierCollection.set(fullModifierName, {
					value: '',
					listeners: [],
					actions: [],
				});
			});
		},
		addActions(modifierActions: IModifierActions) {
			const removeActionsFuncs: (() => void)[] = [];
			for (const [modifierName, actions] of Object.entries(modifierActions)) {
				if (modifierCollection.has(modifierName)) {
					modifierCollection
						.get(modifierName)
						.actions.splice(modifierCollection.get(modifierName).actions.length, 0, ...actions);

					actions.forEach((action) => action(modifierCollection.get(modifierName).value));

					removeActionsFuncs.push(() => {
						modifierCollection.get(modifierName).actions.filter((action) => !actions.includes(action));
					});
				} else {
					throw new Error(`cannot add new action to modifier: ${modifierName} because it does not exsists`);
				}
			}

			return () => {
				removeActionsFuncs.forEach((remover) => remover());
			};
		},
		addListener(modifierName, func, getProps = () => null) {
			if (modifierCollection.has(modifierName)) {
				modifierCollection.get(modifierName).listeners.push(() => func(getProps()));
			} else {
				throw new Error(`cannot add listener to ${modifierName} because it does not exists`);
			}
		},
		removeComponent(compinentUid: ComponentUid) {
			if (proxyCollection.has(compinentUid)) {
				proxyCollection.delete(compinentUid);
				for (const key of modifierCollection.keys()) {
					if (key.startsWith(compinentUid)) {
						modifierCollection.delete(key);
					}
				}
			} else {
				throw new Error(`cannot delete ${compinentUid} because it does not exists`);
			}
		},
	};
};
