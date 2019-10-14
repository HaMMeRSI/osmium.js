export const splitObjectAccessor = (path: string, separator = '.') => {
	return path
		.replace(/\[/g, '.')
		.replace(/\]/g, '')
		.split(separator);
};

export const resolveObjectKey = (path: string, obj, separator = '.') => {
	const properties = splitObjectAccessor(path, separator);
	return properties.reduce((prev, curr) => prev && prev[curr], obj);
};

export const assignByPath = (root, path, value) => {
	const brokenPath = splitObjectAccessor(path);
	const lastKey = brokenPath[brokenPath.length - 1];
	for (let i = 0; i < brokenPath.length - 1; i++) {
		root = root[brokenPath[i]];
	}

	root[lastKey] = value;
};

export const getAccessorFromString = (path: string) => {
	return path.substring(path.indexOf('.') + 1);
};
