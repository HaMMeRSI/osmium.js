export const resolveObjectKey = (path: string, obj, separator = '.') => {
	const properties = path.replace(/\[(\w+)\]/g, '.$1').split(separator);
	return properties.reduce((prev, curr) => prev && prev[curr], obj);
};

export const getAccessorFromString = (path: string) => {
	return path.substring(path.indexOf('.') + 1);
};
