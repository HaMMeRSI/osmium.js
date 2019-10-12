import * as parse5 from 'parse5';
import { OsimDocuments, IHast, IResolvedProps, IOastModifiers } from '../compiler-interfaces';
import { IOsimDocument, IHastObjectAttributes } from '../compiler-interfaces';
import { matchModifierName } from '../../runtime/consts/regexes';
import { componentScopeDelimiter } from '../../common/consts';
import { IHastAttribute } from '../../common/interfaces';
import { OSIM_UID } from './consts';
import { initRuntimeModifiers, IRuntimeModifiers } from './runtimeModifiers';
import { oastBuilder, ENUM_OAST_TYPES } from './oast-builder';
import { IOastBase } from '../oast-interfaces';

let idRunner = 0;
function getId() {
	return idRunner++;
}

function getDomNodeOast(hastNode: IHast, parentProps: IResolvedProps, componentScope: string, runtimeModifiers: IRuntimeModifiers): IOastBase[] {
	const builder = oastBuilder(runtimeModifiers, parentProps, componentScope);
	return hastNode.attrs.map((attr) => {
		if (attr.name === 'for') {
			return builder.build(ENUM_OAST_TYPES.LoopStatement, attr.name, attr.value);
		} else if (attr.name === 'if') {
			return builder.build(ENUM_OAST_TYPES.ConditionStatement, attr.name, attr.value);
		} else if (attr.name.startsWith('@')) {
			return builder.build(ENUM_OAST_TYPES.CallExpression, attr.name, attr.value);
		}

		return builder.build(ENUM_OAST_TYPES.TextExpression, attr.name, attr.value);
	});
}

function getTextNodeOast(hastNode: IHast, parentProps: IResolvedProps, componentScope: string, runtimeModifiers: IRuntimeModifiers): IOastBase[] {
	const builder = oastBuilder(runtimeModifiers, parentProps, componentScope);
	// const fullScopedModifierAccessors = hastNode.value.match(matchFullModifierName);
	return [builder.build(ENUM_OAST_TYPES.TextExpression, 'text', hastNode.value)];
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
			let reolveModifierFunction = getDomNodeOast;
			if (child.nodeName === '#text') {
				reolveModifierFunction = getTextNodeOast;
			}

			child.oast = reolveModifierFunction(child, props, componentUid, runtimeModifiers);
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
