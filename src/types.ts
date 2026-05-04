export interface IPluginInfo {
    [id: string]: IPluginCombined;
}

export interface IPluginCombined {
    id: string;
    name: string;
    modIndex: number;
    eslIndex?: number;
    mediumIndex?: number;
    messages?: Message[];
    warnings?: { [key: string]: boolean };
}

interface Message {
    type: number;
	content: string | Array<{ text: string, language: string }>;
	condition: string;
}