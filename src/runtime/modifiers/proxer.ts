import { createBaseEffect, callAllEffects, initAllEffects } from './effects';

export function createProxer(model, effects) {
	return new Proxy(model, {
		get(_, prop) {
			if (!(prop in model)) {
				model[prop] = Object.create(null);
				effects[prop] = createBaseEffect();
			}

			if (Array.isArray(model)) {
				if (['splice', 'push', 'pop'].includes(prop as string)) {
					return (...args) => {
						const result = model[prop].call(model, ...args);
						if (['splice', 'pop'].includes(prop as string)) {
							effects[prop].call(model, ...args);
						}
						initAllEffects(model, effects);
						effects.$listeners.forEach((listener) => listener());
						return result;
					};
				}
			}

			if (typeof model[prop] === 'object') {
				return createProxer(model[prop], effects[prop]);
			}

			return model[prop];
		},
		set(_, prop, value) {
			model[prop] = value;

			if (prop in effects) {
				initAllEffects(model[prop], effects[prop]);
				callAllEffects(model[prop], effects[prop]);
			} else {
				effects[prop] = createBaseEffect(typeof model[prop]);
				initAllEffects(model[prop], effects[prop]);
			}

			return true;
		},
		deleteProperty(_, prop) {
			if (prop in model) {
				delete model[prop];
				delete effects[prop];
				effects.$listeners.forEach((listener) => listener());
				return true;
			}

			return false;
		},
	});
}
