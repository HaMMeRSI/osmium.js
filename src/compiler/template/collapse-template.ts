import { OsimDocuments, ICollapseResult, Hast } from '../compiler-interfaces';
import { IOsimDocument, IHastAttribute, ISortedParentProps, IHastObjectAttributes } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import * as uniqid from 'uniqid';
import { matchModifierName, matchModifier, getSpecificMatchModifier } from '../../runtime/consts/regexes';

function resolveModifiers(hastNode: Hast, parentProps: ISortedParentProps, componentScope: string): string[] {
	const componentModifiers: string[] = [];
	if (hastNode.attrs) {
		(hastNode.attrs as IHastAttribute[]).forEach((attr): void => {
			const modifierNames = attr.value.match(matchModifierName);
			if (modifierNames) {
				for (const modifierName of modifierNames) {
					if (modifierName in parentProps.staticProps) {
						attr.value = parentProps.staticProps[modifierName].value;
					} else if (modifierName in parentProps.dynamicProps) {
						attr.value = attr.value.replace(modifierName, `${parentProps.dynamicProps[modifierName].componentScope}.${modifierName}`);
					} else {
						const modifier = `${componentScope}.${modifierName}`;
						attr.value = attr.value.replace(modifierName, modifier);
						componentModifiers.push(modifier);
					}
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

					hastNode.value = hastNode.value.replace(getSpecificMatchModifier(modifierName), `{{${modifier.componentScope}.${modifier.value}}}`);
				} else {
					const modifier = `${componentScope}.${modifierName}`;
					hastNode.value = hastNode.value.replace(getSpecificMatchModifier(modifierName), `{{${modifier}}}`);
					componentModifiers.push(modifier);
				}
			}
		}
	}

	return componentModifiers;
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

function collaspseHast(currentOsimDocument: IOsimDocument, subDocuments: OsimDocuments, hast: Hast, parentProps: ISortedParentProps, componentScope): ICollapseResult {
	const allModifiers: Set<string> = new Set();

	for (const child of hast.childNodes) {
		resolveModifiers(child, parentProps, componentScope).forEach((modifier) => {
			allModifiers.add(modifier);
		});

		if (currentOsimDocument.components.includes(child.nodeName)) {
			const newScope = `${child.nodeName}_${uniqid.time()}`;
			const collapsed = collaspseHast(
				subDocuments[child.nodeName],
				subDocuments,
				parse5.parseFragment(subDocuments[child.nodeName].html),
				sortAttributes(child.attrs, componentScope),
				newScope
			);

			collapsed.allModifiers.forEach((modifier) => {
				allModifiers.add(modifier);
			});
			child.attrs.push({ name: 'osim:uid', value: newScope });
			child.childNodes = collapsed.hast.childNodes;
		} else if (child.childNodes && child.childNodes.length > 0) {
			const collapsed = collaspseHast(currentOsimDocument, subDocuments, child, parentProps, componentScope);
			collapsed.allModifiers.forEach((modifier) => {
				allModifiers.add(modifier);
			});
		}
	}

	return { hast, allModifiers: Array.from(allModifiers) };
}

function collapseOsimDocument(osimComponents: OsimDocuments): ICollapseResult {
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
