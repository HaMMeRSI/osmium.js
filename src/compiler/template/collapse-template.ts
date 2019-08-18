import { OsimDocuments, IHast, IResolvedProps } from '../compiler-interfaces';
import { IOsimDocument, IHastObjectAttributes } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import { matchDynamicGetterName, matchDynamicGetter, getSpecificMatchDynamicGetter } from '../../runtime/consts/regexes';
import { componentScopeDelimiter } from '../../common/consts';
import { IHastAttribute } from '../../common/interfaces';

const OSIM_UID = 'osim:uid';
let idRunner = 0;
function getId() {
	return idRunner++;
}

function resolveModifiers(hastNode: IHast, parentProps: IResolvedProps, componentScope: string): Set<string> {
	const componentModifiers: Set<string> = new Set();

	if (hastNode.attrs) {
		hastNode.attrs.forEach((attr): void => {
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

function createPropsForChild(attrs: IHastAttribute[]): IResolvedProps {
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

function collapseOsimDocument(osimComponents: OsimDocuments): IHast {
	function collapseHast(currentOsimDocument: IOsimDocument, activeHast: IHast, props: IResolvedProps, componentUid: string): IHast {
		for (const child of activeHast.childNodes) {
			resolveModifiers(child, props, componentUid);

			if (currentOsimDocument.components.includes(child.nodeName)) {
				const newComponentUid = `${child.nodeName}${getId()}`;
				const modedHast = collapseHast(
					osimComponents[child.nodeName],
					parse5.parseFragment(osimComponents[child.nodeName].html),
					createPropsForChild(child.attrs),
					newComponentUid
				);

				child.attrs.push({ name: OSIM_UID, value: newComponentUid });
				child.childNodes = modedHast.childNodes;
			} else if (child.childNodes && child.childNodes.length > 0) {
				if (child.nodeName === 'osim') {
					child.attrs.push({ name: OSIM_UID, value: `${child.nodeName}${getId()}` });
				}

				collapseHast(currentOsimDocument, child, props, componentUid);
			}
		}

		return activeHast;
	}

	return collapseHast(
		osimComponents.root,
		parse5.parseFragment(osimComponents.root.html),
		{
			dynamicProps: {},
			staticProps: {},
		},
		'root'
	);
}

export { collapseOsimDocument };
