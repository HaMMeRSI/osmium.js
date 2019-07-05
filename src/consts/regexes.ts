export const importFile = /(?<=from ').*?(?=';?)/gm;
export const importedElements = /(?<=({|,| ))\w+(?=(}|,| }| from))/gm;
export const importStatement = /import.*?'.*';?/gm;
export const matchModifierName = /(?<={{ ?)[\w.]+?(?= ?}})/gm;
export const matchModifier = /{{ ?[\w.]+? ?}}/gm;
export const getSpecificMatchModifier = (name): RegExp => new RegExp(`{{ ?${name} ?}}`, 'gm');
