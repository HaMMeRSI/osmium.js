import * as deepmerge from 'deepmerge';
import { IOsimNode } from '../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../helpers/deepmerge-options';

export default (childs = []): IOsimNode => {
	// const dom = { appendChild: (fe) => {} } as any;
	const dom = document.createDocumentFragment();
	let builderFragment: IOsimNode = {
		dom,
		builtins: [],
		modifiersActions: {},
		order: [],
		requestedProps: {},
	};

	childs.forEach((child) => (builderFragment = deepmerge(builderFragment, child, runtimeDeepmergeOptions)));
	return builderFragment;
};
