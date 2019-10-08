import { IHastModifier } from '../compiler-interfaces';
import { ENUM_MODIFIERS_TYPE } from './hast-modifiers';

export interface IRuntimeModifiers {
	add: (name: string, type: ENUM_MODIFIERS_TYPE) => IHastModifier;
	find: (name: string) => IHastModifier;
}
export function initRuntimeModifiers(): IRuntimeModifiers {
	const hastRuntimeModifiers: IHastModifier[] = [];

	return {
		add(name: string, type) {
			const hastModifer = {
				name,
				type,
			};

			hastRuntimeModifiers.push(hastModifer);

			return hastModifer;
		},
		find(name) {
			return hastRuntimeModifiers.find((runtime) => runtime.name.indexOf(name) !== -1);
		},
	};
}
