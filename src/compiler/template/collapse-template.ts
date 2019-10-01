import * as parse5 from 'parse5';
import * as acorn from 'acorn';
import { OsimDocuments, IHast, IResolvedProps } from '../compiler-interfaces';
import { IOsimDocument, IHastObjectAttributes } from '../compiler-interfaces';
import { matchModifierName, matchFullModifierName } from '../../runtime/consts/regexes';
import { componentScopeDelimiter } from '../../common/consts';
import { IHastAttribute } from '../../common/interfaces';
import { OSIM_UID } from './consts';
import { parseJast, extractLoopItems } from './jast';
import { extractModifierName } from './match';

let idRunner = 0;
function getId() {
	return idRunner++;
}

function resolveModifierName(modifierAccessorName, runtimeModifiers, parentProps, componentScope): string {
	const splittedModifierName = modifierAccessorName.split('.');
	const modifierName = splittedModifierName[0];
	let newModifier = `${componentScope}${componentScopeDelimiter}${modifierAccessorName}`;

	if (modifierName in parentProps.staticProps) {
		return parentProps.staticProps[modifierName].value;
	} else if (runtimeModifiers.includes(modifierName)) {
		// splittedModifierName[0] = RUNTIME_PH;
		// newModifier = splittedModifierName.join('.');
		newModifier = `\${${modifierAccessorName}}`;
	} else if (modifierName in parentProps.dynamicProps) {
		const { componentScope: actualComponentScope, value } = parentProps.dynamicProps[modifierName];
		newModifier = `${actualComponentScope}${componentScopeDelimiter}${value}`;
	}

	return newModifier;
}

function resolveDomNodeModifiers(hastNode: IHast, parentProps: IResolvedProps, componentScope: string, runtimeModifiers: string[]) {
	const domModifiers: Set<string> = new Set();
	const parse = parseJast((modifierName) => resolveModifierName(modifierName, runtimeModifiers, parentProps, componentScope));
	function handleForAttr({ value }, runtimeModifiers: string[]) {
		const { params, loopItem } = extractLoopItems(extractModifierName(matchModifierName, value));
		const jastProgram: any = acorn.parse(loopItem);
		runtimeModifiers.push(...params);
		return [{ name: 'loopKey', value: params[0] }, { name: 'loopValue', value: params[1] }, { name: 'loopItem', value: parse(jastProgram.body[0]) }];
	}

	const addAttrs = [];
	hastNode.attrs.forEach((attr): void => {
		const modifierAccessorNameArr = attr.value.match(matchModifierName);
		if (modifierAccessorNameArr) {
			try {
				const modifierAccessorName = modifierAccessorNameArr[0];
				const jastProgram: any = acorn.parse(modifierAccessorName);
				if (attr.name === 'for') {
					addAttrs.push(...handleForAttr(attr, runtimeModifiers));
				} else {
					const parseResult: string = parse(jastProgram.body[0]);
					if (parseResult.startsWith('${')) {
						attr.value = parseResult;
					} else {
						attr.value = `{{${parseResult}}}`;
					}
				}
			} catch (e) {
				throw new Error(`invalid modifier: [${attr.name}, ${attr.value}]`);
			}
		}
	});

	hastNode.attrs.push(...addAttrs);

	return domModifiers;
}

function resolveTextNodeModifiers(hastNode: IHast, parentProps: IResolvedProps, componentScope: string, runtimeModifiers: string[]) {
	const textModifiers: Set<string> = new Set();
	const fullScopedModifierAccessors = hastNode.value.match(matchFullModifierName);

	if (fullScopedModifierAccessors) {
		const parse = parseJast((modifierName) => resolveModifierName(modifierName, runtimeModifiers, parentProps, componentScope));
		for (const fullModifierAccessor of fullScopedModifierAccessors) {
			const modifierAccessorName = fullModifierAccessor.match(matchModifierName)[0];
			const jastProgram: any = acorn.parse(modifierAccessorName);
			const parseResult = parse(jastProgram.body[0]);
			let resolvedModifier = `{{${parseResult}}}`;
			if (parseResult.startsWith('${')) {
				resolvedModifier = parseResult;
			}

			hastNode.value = hastNode.value.replace(fullModifierAccessor, resolvedModifier);
		}
	}

	return textModifiers;
}

function createPropsForChild(attrs: IHastAttribute[]): IResolvedProps {
	const staticProps: IHastObjectAttributes = {};
	const dynamicProps: IHastObjectAttributes = {};

	for (const { name, value } of attrs) {
		const scopedModifierAccessorName = value.match(matchModifierName);

		if (scopedModifierAccessorName) {
			const [componentScope, modifier] = scopedModifierAccessorName[0].split(componentScopeDelimiter);
			dynamicProps[name] = {
				componentScope: componentScope,
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
			let reolveModifierFunction = resolveDomNodeModifiers;
			if (child.nodeName === '#text') {
				reolveModifierFunction = resolveTextNodeModifiers;
			}

			reolveModifierFunction(child, props, componentUid, runtimeModifiers);
			if (currentOsimDocument.components.includes(child.nodeName)) {
				const newComponentUid = `${child.nodeName}${getId()}`;
				const hast = collapseHast(
					osimComponents[child.nodeName],
					parse5.parseFragment(osimComponents[child.nodeName].html),
					createPropsForChild(child.attrs),
					newComponentUid,
					runtimeModifiers
				);

				child.attrs.push({ name: OSIM_UID, value: newComponentUid });
				child.childNodes = hast.childNodes;
			} else if (child.childNodes && child.childNodes.length > 0) {
				if (child.nodeName === 'osim') {
					child.attrs.push({ name: OSIM_UID, value: `${child.nodeName}${getId()}` });
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
