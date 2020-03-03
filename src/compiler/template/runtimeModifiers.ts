import { IOastModifier } from '../compiler-interfaces';
import { ENUM_OAST_TYPES } from './oast-builder';

export interface IRuntimeModifiers {
	add: (name: string, type: ENUM_OAST_TYPES) => IOastModifier;
	find: (name: string) => IOastModifier;
}
export function initRuntimeModifiers(): IRuntimeModifiers {
	const hastRuntimeModifiers: IOastModifier[] = [];

	return {
		add(value, type) {
			const hastModifer: IOastModifier = {
				value,
				type,
			};

			hastRuntimeModifiers.push(hastModifer);

			return hastModifer;
		},
		find(name) {
			return hastRuntimeModifiers.find((runtime) => runtime.value.indexOf(name) !== -1);
		},
	};
}
