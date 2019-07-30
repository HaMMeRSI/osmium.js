import { OsimDocuments, ICollapseResult, IHast, IProps, IAllModifiers } from '../compiler-interfaces';
import { IOsimDocument, IHastAttribute, IHastObjectAttributes } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import * as uniqid from 'uniqid';
import { matchDynamicGetterName, matchDynamicGetter, getSpecificMatchDynamicGetter } from '../../runtime/consts/regexes';
import { componentScopeDelimiter } from '../../common/consts';

function resolveModifiers(hastNode: IHast, parentProps: IProps, componentScope: string): string[] {
	const componentModifiers: string[] = [];
	if (hastNode.attrs) {
		(hastNode.attrs as IHastAttribute[]).forEach((attr): void => {
			const dynamicGetters = attr.value.match(matchDynamicGetterName);

			if (dynamicGetters) {
				for (const dynamicGetter of dynamicGetters) {
					const modifierName = dynamicGetter.split('.')[0];

					if (modifierName in parentProps.staticProps) {
						attr.value = parentProps.staticProps[modifierName].value;
					} else if (modifierName in parentProps.dynamicProps) {
						const { componentScope, value } = parentProps.dynamicProps[modifierName];
						attr.value = attr.value.replace(modifierName, `${componentScope}${componentScopeDelimiter}${value}`);
					} else {
						const modifier = `${componentScope}${componentScopeDelimiter}${modifierName}`;
						attr.value = attr.value.replace(modifierName, modifier);
						componentModifiers.push(modifier);
					}
				}
			}
		});
	} else if (hastNode.nodeName === '#text') {
		const dynamicGettersInText = hastNode.value.match(matchDynamicGetter);

		if (dynamicGettersInText) {
			for (const dynamicGetter of dynamicGettersInText) {
				const dynamicGetterName = dynamicGetter.match(matchDynamicGetterName)[0];
				const modifierName = dynamicGetter.match(matchDynamicGetterName)[0].split('.')[0];

				if (modifierName in parentProps.staticProps) {
					hastNode.value = hastNode.value.replace(
						getSpecificMatchDynamicGetter(dynamicGetterName),
						parentProps.staticProps[modifierName].value
					);
				} else if (modifierName in parentProps.dynamicProps) {
					const { componentScope, value } = parentProps.dynamicProps[modifierName];

					hastNode.value = hastNode.value.replace(
						getSpecificMatchDynamicGetter(dynamicGetterName),
						`{{${componentScope}${componentScopeDelimiter}${dynamicGetterName.replace(modifierName, value)}}}`
					);
				} else {
					const newModifier = `${componentScope}${componentScopeDelimiter}${modifierName}`;
					hastNode.value = hastNode.value.replace(
						getSpecificMatchDynamicGetter(dynamicGetterName),
						`{{${newModifier}}}`
					);
					componentModifiers.push(newModifier);
				}
			}
		}
	}

	return componentModifiers;
}

function sortAttributes(attrs: IHastAttribute[]): IProps {
	const staticProps: IHastObjectAttributes = {};
	const dynamicProps: IHastObjectAttributes = {};

	for (const { name, value } of attrs) {
		const dynamicName = value.match(matchDynamicGetterName);

		if (dynamicName) {
			const [modifierComponentScope, modifier] = dynamicName[0].split(componentScopeDelimiter);
			dynamicProps[name] = {
				componentScope: modifierComponentScope,
				value: modifier,
			};
		} else {
			staticProps[name] = {
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
	hast: IHast,
	props: IProps,
	componentScope: string
): ICollapseResult {
	const allModifiers: IAllModifiers = {
		all: new Set<string>(),
	};

	for (const child of hast.childNodes) {
		resolveModifiers(child, props, componentScope).forEach((modifier) => {
			allModifiers.all.add(modifier);
		});

		if (currentOsimDocument.components.includes(child.nodeName)) {
			const newScope = `${child.nodeName}${uniqid.time()}`;
			const collapsed = collaspseHast(
				subDocuments[child.nodeName],
				subDocuments,
				parse5.parseFragment(subDocuments[child.nodeName].html),
				sortAttributes(child.attrs),
				newScope
			);

			for (const [scope, modifiers] of Object.entries(collapsed.allModifiers)) {
				if (scope === 'all') {
					modifiers.forEach((modifier) => allModifiers.all.add(modifier));
				} else {
					allModifiers[scope] = modifiers;
				}
			}

			child.attrs.push({ name: 'osim:uid', value: newScope });
			child.childNodes = collapsed.hast.childNodes;
		} else if (child.childNodes && child.childNodes.length > 0) {
			let modifierSet: Set<string> = allModifiers.all;
			if (child.nodeName === 'osim') {
				const scope = `${child.nodeName}${uniqid.time()}`;
				modifierSet = new Set<string>();
				allModifiers[scope] = modifierSet;
				child.attrs.push({ name: 'osim:uid', value: scope });
			}

			const collapsed = collaspseHast(currentOsimDocument, subDocuments, child, props, componentScope);
			for (const [scope, modifiers] of Object.entries(collapsed.allModifiers)) {
				if (scope === 'all') {
					modifiers.forEach((modifier) => {
						if (modifier.startsWith(componentScope)) {
							allModifiers.all.add(modifier);
						} else {
							modifierSet.add(modifier);
						}
					});
				} else {
					allModifiers[scope] = modifiers;
				}
			}
		}
	}

	return { hast, allModifiers };
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
