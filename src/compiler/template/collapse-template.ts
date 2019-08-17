import { OsimDocuments, ICollapseResult, IHast, IProps, IModifierScopes } from '../compiler-interfaces';
import { IOsimDocument, IHastObjectAttributes } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import * as uniqid from 'uniqid';
import { matchDynamicGetterName, matchDynamicGetter, getSpecificMatchDynamicGetter } from '../../runtime/consts/regexes';
import { componentScopeDelimiter } from '../../common/consts';
import { IHastAttribute } from '../../common/interfaces';

function resolveModifiers(hastNode: IHast, parentProps: IProps, componentScope: string): Set<string> {
	const componentModifiers: Set<string> = new Set();
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
						const newModifier = `${componentScope}${componentScopeDelimiter}${dynamicGetter}`;
						attr.value = attr.value.replace(dynamicGetter, newModifier);
						componentModifiers.add(newModifier.split('.')[0]);
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
					hastNode.value = hastNode.value.replace(getSpecificMatchDynamicGetter(dynamicGetterName), parentProps.staticProps[modifierName].value);
				} else if (modifierName in parentProps.dynamicProps) {
					const { componentScope, value } = parentProps.dynamicProps[modifierName];

					hastNode.value = hastNode.value.replace(
						getSpecificMatchDynamicGetter(dynamicGetterName),
						`{{${componentScope}${componentScopeDelimiter}${dynamicGetterName.replace(modifierName, value)}}}`
					);
				} else {
					const newModifier = `${componentScope}${componentScopeDelimiter}${dynamicGetterName}`;
					hastNode.value = hastNode.value.replace(getSpecificMatchDynamicGetter(dynamicGetterName), `{{${newModifier}}}`);
					componentModifiers.add(newModifier.split('.')[0]);
				}
			}
		}
	}

	return componentModifiers;
}

function createPropsForChild(attrs: IHastAttribute[]): IProps {
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

function collaspseHast(currentOsimDocument: IOsimDocument, subDocuments: OsimDocuments, hast: IHast, props: IProps, componentUid: string): ICollapseResult {
	const currentScope: IModifierScopes = {
		global: new Set<string>(),
	};

	for (const child of hast.childNodes) {
		resolveModifiers(child, props, componentUid).forEach(currentScope.global.add, currentScope.global);

		if (currentOsimDocument.components.includes(child.nodeName)) {
			const newScope = `${child.nodeName}${uniqid.time()}`;
			const { hast, modifierScopes } = collaspseHast(
				subDocuments[child.nodeName],
				subDocuments,
				parse5.parseFragment(subDocuments[child.nodeName].html),
				createPropsForChild(child.attrs),
				newScope
			);

			for (const [scope, modifiers] of Object.entries(modifierScopes)) {
				if (scope === 'global') {
					modifiers.forEach((modifier) => currentScope.global.add(modifier));
				} else {
					currentScope[scope] = modifiers;
				}
			}

			child.attrs.push({ name: 'osim:uid', value: newScope });
			child.childNodes = hast.childNodes;
		} else if (child.childNodes && child.childNodes.length > 0) {
			let newScope: Set<string> = currentScope.global;
			if (child.nodeName === 'osim') {
				const osimUid = `${child.nodeName}${uniqid.time()}`;
				newScope = new Set<string>();
				currentScope[osimUid] = newScope;
				child.attrs.push({ name: 'osim:uid', value: osimUid });
			}

			const { modifierScopes } = collaspseHast(currentOsimDocument, subDocuments, child, props, componentUid);
			for (const [scope, modifiers] of Object.entries(modifierScopes)) {
				if (scope === 'global') {
					modifiers.forEach((modifier) => {
						if (modifier.startsWith(componentUid)) {
							currentScope.global.add(modifier);
						} else {
							newScope.add(modifier);
						}
					});
				} else {
					currentScope[scope] = modifiers;
				}
			}
		}
	}

	return { hast, modifierScopes: currentScope };
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
