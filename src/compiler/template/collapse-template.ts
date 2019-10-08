import * as parse5 from 'parse5';
import { OsimDocuments, IHast, IResolvedProps, IHastModifiers } from '../compiler-interfaces';
import { IOsimDocument, IHastObjectAttributes } from '../compiler-interfaces';
import { matchModifierName, matchFullModifierName } from '../../runtime/consts/regexes';
import { componentScopeDelimiter } from '../../common/consts';
import { IHastAttribute } from '../../common/interfaces';
import { OSIM_UID } from './consts';
import { parseModifiersForText, parseModifiersForLoop, parseModifiersForAttr, parseModifiersForCondition, parseModifiersForFunc } from './hast-modifiers';
import { initRuntimeModifiers, IRuntimeModifiers } from './runtimeModifiers';

let idRunner = 0;
function getId() {
	return idRunner++;
}

function resolveDomNodeAttrs(hastNode: IHast, parentProps: IResolvedProps, componentScope: string, runtimeModifiers: IRuntimeModifiers): IHastModifiers {
	return hastNode.attrs.reduce((acc: IHastModifiers, { name, value }) => {
		if (name === 'for') {
			return Object.assign({}, acc, parseModifiersForLoop(value, runtimeModifiers, parentProps, componentScope));
		} else if (name === 'if') {
			return Object.assign({}, acc, parseModifiersForCondition(value, runtimeModifiers, parentProps, componentScope));
		} else if (name.startsWith('@')) {
			return Object.assign({}, acc, parseModifiersForFunc(value, runtimeModifiers, parentProps, componentScope));
		}

		return Object.assign({}, acc, parseModifiersForAttr(value, runtimeModifiers, parentProps, componentScope));
	}, {});
}

function resolveTextNodeModifiers(hastNode: IHast, parentProps: IResolvedProps, componentScope: string, runtimeModifiers: IRuntimeModifiers): IHastModifiers {
	const fullScopedModifierAccessors = hastNode.value.match(matchFullModifierName);
	return parseModifiersForText(fullScopedModifierAccessors || [], runtimeModifiers, parentProps, componentScope);
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
	function collapseHast(currentOsimDocument: IOsimDocument, activeHast: IHast, props: IResolvedProps, componentUid: string, runtimeModifiers: IRuntimeModifiers): IHast {
		for (const child of activeHast.childNodes) {
			let reolveModifierFunction = resolveDomNodeAttrs;
			if (child.nodeName === '#text') {
				reolveModifierFunction = resolveTextNodeModifiers;
			}

			child.modifiers = reolveModifierFunction(child, props, componentUid, runtimeModifiers);
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
		initRuntimeModifiers()
	);
}

export { collapseOsimDocument };
