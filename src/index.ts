import { actions, log, selectors, types, util } from 'vortex-api';
import path from 'path';
import { fileURLToPath } from 'url';
import { IPluginCombined } from './types';
import { xEditParams, doNotCleanMessages, gameSupportData, excludedPlugins } from './constants';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let cleaningInProgress = false;
let pluginBeingCleaned = "";

export function setCleaning(status: boolean, pluginName: string = "") {
  cleaningInProgress = status;
  pluginBeingCleaned = pluginName;
}

function init(context: types.IExtensionContext) {
  //Require Vortex 1.1.0+
  context.requireVersion('>1.1.0');
  
  //Requires the plugin manager
  context.requireExtension('gamebryo-plugin-management');
  
  //Add a button to load your entire load order in xEdit. 
  context.registerAction('gamebryo-plugin-icons', 300, 'xEdit', {}, 'Open xEdit',
    () => {
        runxEdit('', context.api, [...xEditParams['autoloadall']]);
        }, 
    () => isSupportedGame(context));

  //Add a QAC button. 
  context.registerAction('gamebryo-plugins-action-icons', 500, 'xEdit', {}, 'Clean with xEdit',
    instanceIds => {
        runxEdit(instanceIds?.[0], context.api, [...xEditParams['quickautoclean']]);
        }, 
    () => isSupportedGame(context)
  );
  
  //View in xEdit button.
  context.registerAction('gamebryo-plugins-action-icons', 100, 'xEdit', {}, 'Open in xEdit',
    instanceIds => {
        //Probably don't want this as a batch action, but will leave it here for now. 
        runxEdit(instanceIds?.[0], context.api, [...xEditParams['autoloadplugin']]);
        }, 
    () => isSupportedGame(context)
  );
  
  context.once(() => {
    //Woohoo! New Icon!
    util.installIconSet('xedit-icons', `${__dirname}/xediticon.svg`);
    
    //We want to react to xEdit closing once we launch it for cleaning.   
    context.api.onStateChange?.(['session', 'base', 'toolsRunning'], async (previous, current) => {
      if (cleaningInProgress && (Object.keys(previous).length > 0) && (Object.keys(current).length === 0)) {
        context.api.sendNotification?.({
          type: "success",
          title: "Plugin Cleaning Completed",
          message: `${pluginBeingCleaned} was cleaned with xEdit.`, 
          group: "xEdit-cleaning-done",
          displayMS: 10000
        });
        setCleaning(false);
        log("debug", "xEdit plugin cleaning completed");
      }
    });

  });
}

function isSupportedGame(context: types.IExtensionContext): boolean {
  const activeGameId = selectors.activeGameId(context.api.getState());
  return gameSupportData.find(g => g.game === activeGameId) ? true : false;
}

export async function runxEdit(pluginName : string | undefined, api : types.IExtensionApi, params : string[]) {
  if (!pluginName) return;
  const state = api.getState();
  const activeGameId = selectors.activeGameId(state);

  //Get Data about our plugin
  const pluginData = util.getSafe<IPluginCombined | undefined>(state, ['session', 'plugins', 'pluginInfo', pluginName.toLowerCase()], undefined);
  if (pluginData) {
    const lootMessages = pluginData.messages || [];
    const doNotCleanMessage = lootMessages.find(m => doNotCleanMessages.includes(m.content as string));
    const missingMaster = pluginData.warnings?.['missing-master'];
    //We can't clean plugins with a LOOT message.
    if (doNotCleanMessage) return api.sendNotification?.({type: 'warning', title: `Cannot clean this plugin`, message:`Vortex could not clean ${pluginData.name}, please check the LOOT messages.`, displayMS: 5000});
    //We can't clean plugins with missing masters. 
    if (missingMaster) return api.sendNotification?.({type: 'warning', title: `Cannot clean this plugin`, message:`Vortex could not clean ${pluginData.name} as it has missing masters.`, displayMS: 5000});
  }
  
  //We can't clean the game ESMs.
  if (excludedPlugins.indexOf(pluginName.toLowerCase()) !== -1 && params.includes('-quickautoclean')) return api.sendNotification?.({type: 'warning', title: `Cannot clean this plugin`, message: `Vortex could not clean ${pluginData?.name} as it is the game master file.`, displayMS: 5000});

  const xEditData = gameSupportData.find(g => g.game === activeGameId);
  if (!xEditData) return;
  //Replace game and plugin params in the arguements array.
  params.indexOf('{gamePara}') !== -1 && xEditData.gameParam ? params[params.indexOf('{gamePara}')] = xEditData.gameParam : null;
  params.indexOf('{pluginName}') !== -1 && pluginName !== '' ? params[params.indexOf('{pluginName}')] = pluginName : null;
  params.indexOf('-quickedit:{pluginName}') !== -1 && pluginName !== '' ? params[params.indexOf('-quickedit:{pluginName}')] = `-quickedit:${pluginName}` : null;

  const gamePath = util.getSafe(state, ['settings', 'gameMode', 'discovered', activeGameId, 'path'], undefined);
   
  const tools = util.getSafe<types.ITool[]>(state, ['settings', 'gameMode', 'discovered', activeGameId, 'tools'], []);
  const xEditKey = tools ? Object.keys(tools).find(t => t === xEditData.exeName) : undefined;
  const xEditTool : types.IDiscoveredTool = xEditKey ? tools[xEditKey] : undefined;

  if (!xEditTool || !xEditTool.path) return api.showErrorNotification?.(`xEdit not found`,`Vortex could not find ${xEditData.exeName}. Please check the tool in your starter dashlet is pointing to the right place.`);

  try {
    await api.runExecutable(xEditTool.path, params,{
      cwd: gamePath,
      suggestDeploy: false,
      shell: false,
      onSpawned: () => api.store?.dispatch(actions.setToolRunning(xEditTool.path, Date.now(), true))
    });
    if (params.includes('-quickautoclean')) setCleaning(true, pluginData?.name ?? pluginName);

  }
  catch(err: unknown) {
    if ((err as { code: string }).code === 'ENOENT') {
      api.showErrorNotification?.(`xEdit not found`,`Failed to run tool. Vortex could not find xEdit at ${xEditTool.path}. Please check the tool in your starter dashlet is pointing to the right place.`);
    } else log('error', 'Error starting xEdit',err);
  }
}


export default init;
