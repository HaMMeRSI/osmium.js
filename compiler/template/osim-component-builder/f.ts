export default (childs = []) => {
	const fragment = document.createDocumentFragment();
	childs.forEach((child) => fragment.appendChild(child));

	return fragment;
};
