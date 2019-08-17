export const runtimeDeepmergeOptions = {
	customMerge(key) {
		if (key === 'dom') {
			return (dom1: Node, dom2: Node) => {
				return dom1;
			};
		}
	},
};
