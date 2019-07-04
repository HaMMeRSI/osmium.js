/* eslint-disable @typescript-eslint/no-explicit-any */
import { IOsimDocument } from '../compiler-interfaces';
import * as parse5 from 'parse5';

function collaspseHast(osimDocumentTree: IOsimDocument, hast: any): any {
	for (let i = 0; i < hast.childNodes.length; i++) {
		const child = hast.childNodes[i];

		if (osimDocumentTree.components.includes(child.nodeName)) {
			const newArray = collaspseHast(
				osimDocumentTree.subDocuments[child.nodeName],
				parse5.parseFragment(osimDocumentTree.subDocuments[child.nodeName].html)
			).childNodes;
			hast.childNodes.splice(i, 1, ...newArray);
		} else if (child.childNodes && child.childNodes.length > 0) {
			collaspseHast(osimDocumentTree, child);
		}
	}

	return hast;
}

function collapseTemplate(osimDocumentTree: IOsimDocument): string {
	const res = collaspseHast(osimDocumentTree, parse5.parseFragment(osimDocumentTree.html));
	return parse5.serialize(res);
}

export { collapseTemplate };
