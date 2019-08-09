import { IOsmiumModifiers, IOsimNode, IModifierManager } from '../../runtime-interfaces';

export const getConditionBuiltinEvaluationFunction = (uid: string, builtinCondition: (modifiers) => IOsimNode, domPlaceHolder: Comment) => {
	let childNodes: ChildNode[] = [];
	let remove = null;

	return (modifierManager: IModifierManager, passedModifiers: IOsmiumModifiers): IOsimNode => {
		const newONode = builtinCondition(passedModifiers);

		if (newONode === null) {
			if (childNodes.length > 0) {
				childNodes[0].replaceWith(domPlaceHolder);

				for (let i = 1; i < childNodes.length; i++) {
					childNodes[i].parentNode.removeChild(childNodes[i]);
				}

				remove();
				childNodes = [];
			}

			return null;
		}

		remove = () => {
			newONode.removers.forEach((remover) => remover());
			modifierManager.removeComponent(uid);
			remove = null;
		};

		childNodes = Array.from(newONode.dom.childNodes);
		domPlaceHolder.replaceWith(newONode.dom);

		return newONode;
	};
};
