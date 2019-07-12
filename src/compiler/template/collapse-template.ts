import { OsimDocuments } from '../compiler-interfaces';
import { IOsimDocument, IHastAttribute, Hast, ISortedParentProps, IHastObjectAttributes } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import * as uniqid from 'uniqid';
import { matchModifierName, matchModifier, getSpecificMatchModifier } from '../../runtime/consts/regexes';

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
			const [modifierComponentScope, modifier] = dynamicName[0].split('.');
			dynamicProps[name] = {
				componentScope: modifierComponentScope,
				value: modifier,
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
	subDocuments: OsimDocuments,
	hast: Hast,
	parentProps: ISortedParentProps,
	componentScope
): { hast: Hast; documentOsimUids: string[] } {
	let documentOsimUids: string[] = [];

	for (const child of hast.childNodes) {
		resolveModifiers(child, parentProps, componentScope);

		if (currentOsimDocument.components.includes(child.nodeName)) {
			const newScope = `${child.nodeName}_${uniqid.time()}`;
			documentOsimUids.push(newScope);
			const collapsed = collaspseHast(
				subDocuments[child.nodeName],
				subDocuments,
				parse5.parseFragment(subDocuments[child.nodeName].html),
				sortAttributes(child.attrs, componentScope),
				newScope
			);

			documentOsimUids = documentOsimUids.concat(collapsed.documentOsimUids);
			child.attrs.push({ name: 'osim:uid', value: newScope });
			child.childNodes = collapsed.hast.childNodes;
		} else if (child.childNodes && child.childNodes.length > 0) {
			const collapsed = collaspseHast(currentOsimDocument, subDocuments, child, parentProps, componentScope);
			documentOsimUids = documentOsimUids.concat(collapsed.documentOsimUids);
		}
	}

	return { hast, documentOsimUids };
}

function collapseOsimDocument(osimComponents: OsimDocuments): Hast {
	return collaspseHast(
		osimComponents.root,
		osimComponents,
		parse5.parseFragment(osimComponents.root.html),
		{
			dynamicProps: {},
			staticProps: {},
		},
		'root'
	);
}

export { collapseOsimDocument };
