// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IModifierF extends ModifierAction {
	addActions: (action: ModifierAction[]) => () => void;
	addListener: (func, getProps: () => {}) => () => void;
}

export interface IModifier {
	addActions: (action: ModifierAction[]) => () => void;
	addListener: (func, getProps: () => {}) => () => void;
}

export type ComponentUid = string;

export interface IOsmiumComponentModifiers {
	[modifier: string]: IModifier;
}
export interface IModifierInstance {
	value: any;
	listeners: (() => void)[];
	actions: ModifierAction[];
}
export type IOsmiumModifiers = Map<ComponentUid, IModifierInstance>;

export type ModifierAction = (newValue?) => void;

export interface IModifierManager {
	modifiers: Record<ComponentUid, any>;
	getModifier: (modifierName: string) => any;
	addAction(path: string, modifierActions: ModifierAction);
	addListener(modifierName, func, getProps?);
	removeComponent(compinentUid: ComponentUid);
}

export type Props = (props: { [modifierName: string]: string }) => void;
export type RegisterToProps = (f: Props) => void;

export interface IComponentProps {
	[Symbol.iterator]();
	attr: string;
	modifier: string;
}
export interface IRequestedProps {
	[componentUid: string]: IComponentProps[];
}
export interface IBuiltinData {
	usedModifiers: string[];
	loop?: string;
}

export interface IBuiltinDomResult {
	nodes: ChildNode[];
}

export interface IBuiltins {
	uid: string;
	type: string;
	builtinData: IBuiltinData;
	evaluationFunction: (modifierManager: IModifierManager, modifiers: IOsmiumModifiers) => IOsimNode;
}

export type IOsimChilds = IOsimNode[];

export interface IOsimOrder {
	uid: string;
	componentName: string;
}

export type OsimNodeLauncher = (parent: IOsimNode) => () => void;

export type ComponentFuncs = {
	[name: string]: (modifiers: IOsmiumComponentModifiers, registerToProps: RegisterToProps) => void;
};

export interface IOsimNode {
	dom: Node;
	removers: (() => void)[];
	addChild: (childONode: IOsimNode) => void;
	addRemover: (remover: () => void) => void;
	remove: () => void;
	removeChilds: () => void;
	compute: (componentFuncs: ComponentFuncs, modifiersManager: IModifierManager) => void;
}

export type EvaluationFunction = (getModifier: (modifierName: string) => any) => IOsimChilds | IOsimChilds[];
