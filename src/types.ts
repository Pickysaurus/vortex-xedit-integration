import { types } from "@nexusmods/vortex-api";

export type IStateWithPluginData = Omit<types.IState, 'session' | 'persistent'> & {
    session: types.IState['session'] & { 
        plugins: { 
            pluginInfo: Record<string, IPluginCombined>;
            pluginList: Record<string, IPluginCombined>;
        }, 
        xEditCleaning: { active: boolean, name: string | undefined }
    } 
    persistent: types.IState['persistent'] & { xEditCleaning: Record<string, string> }
}

export interface IPlugin {
    modId?: string;
    filePath: string;
    isNative: boolean;
    warnings: Record<string, boolean>;
    deployed: boolean;
}

export interface IPluginInfo {
    id: string;
    name: string;
    modIndex: number;
    eslIndex?: number;
    mediumIndex?: number;
    messages: Message[];
    warnings?: Record<string, boolean>;
}

export type IPluginCombined = IPluginInfo & IPlugin;

interface Message {
    type: number;
	content: string | Array<{ text: string, language: string }>;
	condition: string;
}