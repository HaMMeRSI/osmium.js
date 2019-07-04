import { IOsimNode } from '../../compiler-interfaces';

export default (childs = []): IOsimNode => {
	const fragment = document.createDocumentFragment();
	childs.forEach((child): void => fragment.appendChild(child));

	return { dom: fragment };
};
