import { IOastModifier } from '../compiler-interfaces';
import { ENUM_OAST_TYPES } from './oast-builder';

export interface IRuntimeModifiers {
	add: (name: string, scope: string, type: ENUM_OAST_TYPES) => string;
	find: (name: string) => IOastModifier;
}
export function initRuntimeModifiers(): IRuntimeModifiers {
	const hastRuntimeModifiers: IOastModifier[] = [];

	return {
		add(value, scope, type) {
			const hastModifer: IOastModifier = {
				value,
				type,
				scope,
			};

			hastRuntimeModifiers.push(hastModifer);

			return value;
		},
		find(name) {
			return hastRuntimeModifiers.find((runtime) => runtime.value.indexOf(name) !== -1);
		},
	};
}
