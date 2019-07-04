export const importFile = /(?<=from ').*?(?=';?)/gm;
export const importedElements = /(?<=({|,| ))\w+(?=(}|,| }| from))/gm;
export const importStatement = /import.*?'.*';?/gm;
export const dynamicAttribute = /(?<=\$\{).*?(?=})/gm;
