import { SubDocuments } from '../compiler-interfaces';
import { IOsimDocument, IHastAttribute, Hast, ISortedParentProps, IHastObjectAttributes, IOsimRootDocument } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import * as uniqid from 'uniqid';
import { matchModifierName, matchModifier, getSpecificMatchModifier } from '../../consts/regexes';

function resolveModifiers(hastNode: Hast, parentProps: ISortedParentProps, componentScope: string): void {
	if (hastNode.attrs) {
		(hastNode.attrs as IHastAttribute[]).forEach((attr): void => {
			const modifierName = attr.value.match(matchModifierName);
			if (modifierName) {
				if (modifierName[0] in parentProps.staticProps) {
					attr.value = parentProps.staticProps[modifierName[0]].value;
				} else if (modifierName[0] in parentProps.dynamicProps) {
					attr.value = `{{${parentProps.dynamicProps[modifierName[0]].componentScope}.${modifierName[0]}}}`;
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
					hastNode.value = hastNode.value.replace(getSpecificMatchModifier(modifierName), parentProps.staticProps[modifierName].value);
				} else if (modifierName in parentProps.dynamicProps) {
					const modifier = parentProps.dynamicProps[modifierName];
					hastNode.value = hastNode.value.replace(
						getSpecificMatchModifier(modifierName),
						`{{${modifier.componentScope}.${modifier.value}}}`
					);
				} else {
					hastNode.value = hastNode.value.replace(
						getSpecificMatchModifier(modifierName),
						`{{${componentScope}.${parentProps.dynamicProps[modifierName].value}}}`
					);
				}
			}
		}
	}
}

function sortAttributes(attrs: IHastAttribute[], componentScope: string): ISortedParentProps {
	const staticProps: IHastObjectAttributes = {};
	const dynamicProps: IHastObjectAttributes = {};

	for (const { name, value } of attrs) {
		const dynamicName = value.match(matchModifierName);
		if (dynamicName) {
			const splittedModifier = dynamicName[0].split('.');
			dynamicProps[name] = {
				componentScope: splittedModifier[0],
				value: splittedModifier[1],
			};
		} else {
			staticProps[name] = {
				componentScope,
				value,
			};
		}
	}

	return {
		staticProps,
		dynamicProps,
	};
}

function collaspseHast(
	currentOsimDocument: IOsimDocument,
	subDocuments: SubDocuments,
	hast: Hast,
	parentProps: ISortedParentProps,
	componentScope
): Hast {
	for (let i = 0; i < hast.childNodes.length; i++) {
		const child = hast.childNodes[i];

		resolveModifiers(child, parentProps, componentScope);
		if (currentOsimDocument.components.includes(child.nodeName)) {
			const newScope = `${child.nodeName}_${uniqid.time()}`;
			const newArray = collaspseHast(
				subDocuments[child.nodeName],
				subDocuments,
				parse5.parseFragment(subDocuments[child.nodeName].html),
				sortAttributes(child.attrs, componentScope),
				newScope
			).childNodes;

			hast.childNodes[i].attrs.push({ name: 'osim:uid', value: newScope });
			hast.childNodes[i].childNodes = newArray;
		} else if (child.childNodes && child.childNodes.length > 0) {
			collaspseHast(currentOsimDocument, subDocuments, child, parentProps, componentScope);
		}
	}

	return hast;
}

function collapseOsimDocument(osimDocumentTree: IOsimRootDocument): Hast {
	return collaspseHast(
		osimDocumentTree.mainDocument,
		osimDocumentTree.subDocuments,
		parse5.parseFragment(osimDocumentTree.mainDocument.html),
		{
			dynamicProps: {},
			staticProps: {},
		},
		'root'
	);
}

export { collapseOsimDocument };
