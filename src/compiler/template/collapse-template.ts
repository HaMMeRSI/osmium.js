import { OsimDocuments, IHast, IResolvedProps } from '../compiler-interfaces';
import { IOsimDocument, IHastObjectAttributes } from '../compiler-interfaces';
import * as parse5 from 'parse5';
import { matchDynamicGetterName, matchDynamicGetter, getSpecificMatchDynamicGetter } from '../../runtime/consts/regexes';
import { componentScopeDelimiter } from '../../common/consts';
import { IHastAttribute } from '../../common/interfaces';
import { RUNTIME_PH, OSIM_UID } from './consts';

let idRunner = 0;
function getId() {
	return idRunner++;
}

function resolveModifiers(hastNode: IHast, parentProps: IResolvedProps, componentScope: string, runtimeModifiers: string[]): Set<string> {
	const componentModifiers: Set<string> = new Set();

	if (hastNode.attrs) {
		hastNode.attrs.forEach((attr): void => {
			const dynamicGetters = attr.value.match(matchDynamicGetterName);

			if (dynamicGetters) {
				for (const dynamicGetter of dynamicGetters) {
					const modifierName = dynamicGetter.split('.')[0];

					if (runtimeModifiers.includes(modifierName)) {
						attr.value = attr.value.replace(new RegExp(`{{${modifierName}}}`, 'g'), RUNTIME_PH);
					} else if (modifierName in parentProps.staticProps) {
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
				const runtimeModifiersInText = runtimeModifiers.filter((currMod) => hastNode.value.includes(`{{${currMod}}}`));

				if (runtimeModifiersInText.length > 0) {
					runtimeModifiersInText.forEach((runtimeModifier) => {
						hastNode.value = hastNode.value.replace(new RegExp(`{{${runtimeModifier}}}`, 'g'), RUNTIME_PH);
					});
				} else if (modifierName in parentProps.staticProps) {
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
	function collapseHast(currentOsimDocument: IOsimDocument, activeHast: IHast, props: IResolvedProps, componentUid: string, runtimeModifiers: string[]): IHast {
		for (const child of activeHast.childNodes) {
			resolveModifiers(child, props, componentUid, runtimeModifiers);

			if (currentOsimDocument.components.includes(child.nodeName)) {
				const newComponentUid = `${child.nodeName}${getId()}`;
				const modedHast = collapseHast(
					osimComponents[child.nodeName],
					parse5.parseFragment(osimComponents[child.nodeName].html),
					createPropsForChild(child.attrs),
					newComponentUid,
					runtimeModifiers
				);

				child.attrs.push({ name: OSIM_UID, value: newComponentUid });
				child.childNodes = modedHast.childNodes;
			} else if (child.childNodes && child.childNodes.length > 0) {
				if (child.nodeName === 'osim') {
					child.attrs.push({ name: OSIM_UID, value: `${child.nodeName}${getId()}` });
					const loopIndex = child.attrs.find((attr) => attr.name === 'index');
					const loopvalue = child.attrs.find((attr) => attr.name === 'value');
					if (loopIndex) {
						runtimeModifiers.push(loopIndex.value);
					}
					if (loopvalue) {
						runtimeModifiers.push(loopvalue.value);
					}
				}

				collapseHast(currentOsimDocument, child, props, componentUid, runtimeModifiers);
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
		'root',
		[]
	);
}

export { collapseOsimDocument };
