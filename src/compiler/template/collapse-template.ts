import { IOsimDocument, IHastAttribute, HastTree, ISortedAttributes, IHastObjectAttributes } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import { matchModifierName, matchModifier, getSpecificMatchModifier } from '../../consts/regexes';

function resolveStaticProps(hastNode, parentProps, componentScope): void {
	if (hastNode.attrs) {
		(hastNode.attrs as IHastAttribute[]).forEach((attr): void => {
			const modifierName = attr.value.match(matchModifierName);
			if (modifierName) {
				if (modifierName[0] in parentProps.staticProps) {
					attr.value = parentProps.staticProps[modifierName[0]];
				} else {
					attr.value = `{{${componentScope}.${modifierName[0]}}}`;
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
				} else {
					hastNode.value = hastNode.value.replace(getSpecificMatchModifier(modifierName), `{{${componentScope}.${modifierName}}}`);
				}
			}
		}
	}
}

function sortAttributes(attrs: IHastAttribute[]): ISortedAttributes {
	const staticProps: IHastObjectAttributes = {};
	const dynamicProps: IHastObjectAttributes = {};

	for (const { name, value } of attrs) {
		const dynamicName = value.match(matchModifierName);
		if (dynamicName) {
			dynamicProps[dynamicName[0].split('.')[1]] = value;
		} else {
			staticProps[name] = value;
		}
	}

	return {
		staticProps,
		dynamicProps,
	};
}

function collaspseHast(osimDocumentTree: IOsimDocument, hast: HastTree, parentProps: ISortedAttributes, componentScope): HastTree {
	for (let i = 0; i < hast.childNodes.length; i++) {
		const child = hast.childNodes[i];

		resolveStaticProps(child, parentProps, componentScope);
		if (osimDocumentTree.components.includes(child.nodeName)) {
			const newArray = collaspseHast(
				osimDocumentTree.subDocuments[child.nodeName],
				parse5.parseFragment(osimDocumentTree.subDocuments[child.nodeName].html),
				sortAttributes(child.attrs),
				child.nodeName
			).childNodes;

			hast.childNodes.splice(i, 1, ...newArray);
		} else if (child.childNodes && child.childNodes.length > 0) {
			collaspseHast(osimDocumentTree, child, parentProps, componentScope);
		}
	}

	return hast;
}

function collapseOsimDocument(osimDocumentTree: IOsimDocument): HastTree {
	return collaspseHast(
		osimDocumentTree,
		parse5.parseFragment(osimDocumentTree.html),
		{
			dynamicProps: {},
			staticProps: {},
		},
		'root'
	);
}

export { collapseOsimDocument };
