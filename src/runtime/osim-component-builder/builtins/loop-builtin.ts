import { IOsimChilds, IModifierManager, IOsimNode } from '../../runtime-interfaces';
import f from '../f';
import { componentScopeDelimiter } from '../../../common/consts';
interface ILoopItem {
	onode: IOsimNode;
	i: any;
}
export const getLoopBuiltinEvaluationFunction = (
	childEvaluationFunction: (modifiers) => () => IOsimNode,
	loopElement: string,
	domPlaceHolder: Comment
) => {
	let childNodes: ChildNode[] = [];
	return (passedModifiers) => {
		const evaluatedLoopItems = childEvaluationFunction(passedModifiers);

		return (modifierManager: IModifierManager) => {
			if (childNodes.length > 0) {
				childNodes[0].replaceWith(domPlaceHolder);

				for (let i = 1; i < childNodes.length; i++) {
					childNodes[i].parentNode.removeChild(childNodes[i]);
				}

				childNodes = [];
			}
			const loopItems: any = evaluatedLoopItems();
			const onodeBuiltin = f(
				loopItems.flatMap((item: ILoopItem) => {
					for (const [fullModifierName, actions] of Object.entries(item.onode.modifiersActions)) {
						if (fullModifierName.split(componentScopeDelimiter)[1] === loopElement) {
							actions.forEach((action) => action(item.i));
							actions.length = 0;
						}
					}
					return item.onode;
				})
			);
			childNodes = Array.from(onodeBuiltin.dom.childNodes);
			domPlaceHolder.replaceWith(onodeBuiltin.dom);
			return onodeBuiltin;
		};
	};
};
