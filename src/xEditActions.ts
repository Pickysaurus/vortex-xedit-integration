import { actions, selectors, types, log } from '@nexusmods/vortex-api';
import fs from 'node:fs';

import { doNotCleanMessages, excludedPlugins, gameSupportData, xEditNames } from './constants';
import type { IPlugin, IPluginCombined, IPluginInfo, IStateWithPluginData } from './types';
import { persistent, session } from './actions';

export async function runxEdit(pluginName : string | undefined, api : types.IExtensionApi, params : string[]) {
  if (!pluginName) return;
  const state = api.getState() as IStateWithPluginData;
  const activeGameId = selectors.activeGameId(state);

  //Get Data about our plugin
  const pluginList: IPlugin | undefined = state.session.plugins.pluginList[pluginName.toLowerCase()];
  const pluginInfo: IPluginInfo | undefined = state.session.plugins.pluginInfo[pluginName.toLowerCase()];
  const pluginData: IPluginCombined = { 
    ...pluginList, 
    ...pluginInfo, 
    warnings: { ...pluginList.warnings, ...pluginInfo.warnings } 
  };

  if (pluginData) {
    const lootMessages = pluginData.messages || [];
    const doNotCleanMessage = lootMessages.find(m => doNotCleanMessages.includes(m.content as string));
    const missingMaster = pluginData.warnings?.['missing-master'];
    //We can't clean plugins with a LOOT message.
    if (doNotCleanMessage) return api.sendNotification?.({
        type: 'warning', 
        title: `Cannot clean this plugin`, 
        message:`Vortex could not clean ${pluginData.name}, please check the LOOT messages.`, 
        displayMS: 5000
    });
    //We can't clean plugins with missing masters. 
    if (missingMaster) return api.sendNotification?.({
        type: 'warning', 
        title: `Cannot clean this plugin`, 
        message:`Vortex could not clean ${pluginData.name} as it has missing masters.`, 
        displayMS: 5000
    });
  }
  
  //We can't clean the game ESMs.
  if (excludedPlugins.indexOf(pluginName.toLowerCase()) !== -1 && params.includes('-quickautoclean')) return api.sendNotification?.({type: 'warning', title: `Cannot clean this plugin`, message: `Vortex could not clean ${pluginData?.name} as it is the game master file.`, displayMS: 5000});

  const xEditData = gameSupportData[activeGameId];
  if (!xEditData) return;
  //Replace game and plugin params in the arguements array.
  params.indexOf('{gamePara}') !== -1 && xEditData.gameParam ? params[params.indexOf('{gamePara}')] = xEditData.gameParam : null;
  params.indexOf('{pluginName}') !== -1 && pluginName !== '' ? params[params.indexOf('{pluginName}')] = pluginName : null;
  params.indexOf('-quickedit:{pluginName}') !== -1 && pluginName !== '' ? params[params.indexOf('-quickedit:{pluginName}')] = `-quickedit:${pluginName}` : null;

  const gamePath: string | undefined = state.settings.gameMode.discovered[activeGameId]?.path;
   
  const tools: Record<string, types.IDiscoveredTool> = state.settings.gameMode.discovered[activeGameId]?.tools ?? {};
  const savedTool = state.persistent.xEditCleaning?.[activeGameId];
  let xEditTool: types.IDiscoveredTool | undefined = tools[savedTool];
  if (!xEditTool) {
    // The xEdit tool for this game has either never been set or no longer exists, so we need to discover it again.
    xEditTool = discoverxEdit(tools, activeGameId, api);
    if (!xEditTool || !xEditTool.path) return api.showErrorNotification?.(
        `xEdit not found`,
        `Vortex could not find ${xEditData.exeName}. Please add an xEdit tool to the Tools section and try again.`
    );
  }

  // Check the EXE we're pointing to actually exists.
  const exists = fs.existsSync(xEditTool.path);
  if (!exists) {
    api.store?.dispatch(persistent.SET_EDIT_TOOL_BY_GAME(activeGameId, undefined));
    return api.showErrorNotification?.(
        'xEdit tool is invalid',
        `The tool ${xEditTool.name} is pointing to a file that does not exist (${xEditTool.path}). Please correct the path in the Tools section and try again.`
    )
  }

  const isQAC = params.includes('-quickautoclean');

  try {
    await api.runExecutable(xEditTool.path, params,{
      cwd: gamePath,
      suggestDeploy: false,
      shell: false,
      onSpawned: () => {
        if (isQAC) api.store?.dispatch(session.SET_CLEANING_PLUGIN(true, pluginData?.name ?? pluginName));
        api.store?.dispatch(actions.setToolRunning(xEditTool.path, Date.now(), true))
      },
      onExit: () => api.store?.dispatch(actions.setToolStopped(xEditTool.path))
    });

  }
  catch(err: unknown) {
    if ((err as { code: string }).code === 'ENOENT') {
      api.showErrorNotification?.(`xEdit not found`,`Failed to run tool. Vortex could not find xEdit at ${xEditTool.path}. Please check the tool in your starter dashlet is pointing to the right place.`);
    } else log('error', 'Error starting xEdit',err);
  }
}

export function discoverxEdit(tools: Record<string, types.IDiscoveredTool>, gameId: string, api: types.IExtensionApi) {
    // Only check discovered tools
    const toolList: types.IDiscoveredTool[] = Object.values(tools).filter(t => t.path !== undefined);
    const candidates = toolList.filter(t => xEditNames.some(n => t.path.toLowerCase().endsWith(n)));
    if (!candidates.length) return undefined;
    const selected = candidates[0];

    api.store?.dispatch(persistent.SET_EDIT_TOOL_BY_GAME(gameId, selected.id));
    return selected;
}
