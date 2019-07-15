export const runtimeDeepmergeOptions = {
	customMerge(key) {
		if (key === 'dom') {
			return (dom1: Node, dom2: Node) => {
				dom1.appendChild(dom2);
				return dom1;
			};
		}
	},
};
