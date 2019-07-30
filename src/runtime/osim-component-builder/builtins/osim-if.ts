import * as deepmerge from 'deepmerge';
import { IOsmiumModifiers, IOsimNode, IModifierManager } from '../../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../../helpers/deepmerge-options';

export const getConditionBuiltinEvaluationFunction = (
	childEvaluationFunction: (modifiers) => () => IOsimNode,
	domPlaceHolder: Comment
) => {
	let childNodes: ChildNode[] = [];
	let unregisterFromModfiers = null;

	return (passedModifiers: IOsmiumModifiers): ((modifierManager) => IOsimNode) => {
		const evaluatedONode = childEvaluationFunction(passedModifiers);

		if (evaluatedONode === null) {
			if (childNodes.length > 0) {
				childNodes[0].replaceWith(domPlaceHolder);

				for (let i = 1; i < childNodes.length; i++) {
					childNodes[i].parentNode.removeChild(childNodes[i]);
				}

				unregisterFromModfiers();
				childNodes = [];
				unregisterFromModfiers = null;
			}
			return null;
		}

		return (modifierManager: IModifierManager) => {
			let onodeBuiltin: IOsimNode = {
				dom: document.createDocumentFragment(),
				builtins: [],
				modifiersActions: {},
				order: [],
				requestedProps: {},
			};

			const newONode = evaluatedONode();
			unregisterFromModfiers = modifierManager.addActions(newONode.modifiersActions);
			onodeBuiltin = deepmerge(onodeBuiltin, newONode, runtimeDeepmergeOptions);
			childNodes = Array.from(onodeBuiltin.dom.childNodes);
			domPlaceHolder.replaceWith(onodeBuiltin.dom);
			return onodeBuiltin;
		};
	};
};
