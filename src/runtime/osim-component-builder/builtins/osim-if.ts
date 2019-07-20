import * as deepmerge from 'deepmerge';
import { IOsmiumModifiers, IOsimNode, IOsimChilds } from '../../runtime-interfaces';
import { runtimeDeepmergeOptions } from '../../helpers/deepmerge-options';
import { componentScopeDelimiter } from '../../consts/delimiter';

export const getConditionBuiltinEvaluationFunction = (childEvaluationFunction: (modifiers) => IOsimChilds, builtinPlaceHolder: Comment) => {
	let childNodes: ChildNode[] = [];
	let unregisterFromModfiers = null;

	return (passedModifiers: IOsmiumModifiers): IOsimNode => {
		let onodeBuiltin: IOsimNode = {
			dom: document.createDocumentFragment(),
			builtins: [],
			modifiersActions: {},
			order: [],
			requestedProps: {},
		};

		const evaluatedONode = childEvaluationFunction(passedModifiers);
		if (evaluatedONode === null) {
			if (childNodes.length > 0) {
				childNodes[0].replaceWith(builtinPlaceHolder);

				for (let i = 1; i < childNodes.length; i++) {
					childNodes[i].parentNode.removeChild(childNodes[i]);
				}

				unregisterFromModfiers();
				childNodes = [];
				unregisterFromModfiers = null;
			}
		} else {
			onodeBuiltin = deepmerge(onodeBuiltin, evaluatedONode, runtimeDeepmergeOptions);

			const unregistrers = Object.entries(onodeBuiltin.modifiersActions).map(([fullModifierName, actions]) => {
				const [componentUid, modifierName] = fullModifierName.split(componentScopeDelimiter);
				return passedModifiers[componentUid][modifierName].addActions(actions);
			});
			unregisterFromModfiers = (): void => {
				unregistrers.forEach((unregistrer) => unregistrer());
			};

			childNodes = Array.from(onodeBuiltin.dom.childNodes);
			builtinPlaceHolder.replaceWith(onodeBuiltin.dom);
		}

		return onodeBuiltin;
	};
};
