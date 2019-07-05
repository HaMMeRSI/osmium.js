import { IOsimDocument, IHastAttribute, HastTree, IOsimTemplateAttributes, IHastObjectAttributes } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import { matchModifierName, matchModifier, getSpecificMatchModifier } from '../../consts/regexes';

function resolveStaticProps(hastNode, parentProps): void {
	if (hastNode.attrs) {
		(hastNode.attrs as IHastAttribute[]).forEach((attr): void => {
			const modifierName = attr.value.match(matchModifierName);
			if (modifierName) {
				if (modifierName[0] in parentProps.staticProps) {
					attr.value = parentProps.staticProps[modifierName[0]];
				}
			}
		});
	} else if (hastNode.nodeName === '#text') {
		const modifiersInText = hastNode.value.match(matchModifier);
		if (modifiersInText) {
			for (const modifier of modifiersInText) {
				const modifierName = modifier.match(matchModifierName)[0];
				if (modifierName in parentProps.staticProps) {
					hastNode.value = hastNode.value.replace(getSpecificMatchModifier(modifierName), parentProps.staticProps[modifierName]);
				}
			}
		}
	}
}

function parseAttributes(attrs: IHastAttribute[]): IOsimTemplateAttributes {
	const staticProps: IHastObjectAttributes = {};
	const dynamicProps: IHastObjectAttributes = {};

	for (const { name, value } of attrs) {
		const dynamicName = value.match(matchModifierName);
		if (dynamicName) {
			dynamicProps[dynamicName[0]] = value;
		} else {
			staticProps[name] = value;
		}
	}

	return {
		staticProps,
		dynamicProps,
	};
}

function collaspseHast(osimDocumentTree: IOsimDocument, hast: HastTree, parentProps: IOsimTemplateAttributes): HastTree {
	for (let i = 0; i < hast.childNodes.length; i++) {
		const child = hast.childNodes[i];

		resolveStaticProps(child, parentProps);
		if (osimDocumentTree.components.includes(child.nodeName)) {
			const newArray = collaspseHast(
				osimDocumentTree.subDocuments[child.nodeName],
				parse5.parseFragment(osimDocumentTree.subDocuments[child.nodeName].html),
				parseAttributes(child.attrs)
			).childNodes;

			hast.childNodes.splice(i, 1, ...newArray);
		} else if (child.childNodes && child.childNodes.length > 0) {
			collaspseHast(osimDocumentTree, child, parentProps);
		}
	}

	return hast;
}

function collapseTemplate(osimDocumentTree: IOsimDocument): string {
	const res = collaspseHast(osimDocumentTree, parse5.parseFragment(osimDocumentTree.html), {
		dynamicProps: {},
		staticProps: {},
	});
	return parse5.serialize(res);
}

export { collapseTemplate };
