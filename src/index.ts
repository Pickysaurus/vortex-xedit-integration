import { log, selectors, types, util } from '@nexusmods/vortex-api';
import path from 'path';
import { fileURLToPath } from 'url';
import { runxEdit } from './xEditActions';
import { xEditParams, gameSupportData } from './constants';
import { xEditPersistentReducer, xEditSessionReducer } from './reducers';
import { IStateWithPluginData } from './types';
import { session } from './actions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function init(context: types.IExtensionContext) {
  //Require Vortex 1.1.0+
  context.requireVersion('>1.1.0');

  // Register Reducers to store relevant state data
  context.registerReducer(['session', 'xEditCleaning'], xEditSessionReducer);

  context.registerReducer(['persistent', 'xEditCleaning'], xEditPersistentReducer);
  
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
      const { active: cleaningInProgress, name: pluginBeingCleaned } = (context.api.getState() as IStateWithPluginData).session.xEditCleaning
      if (cleaningInProgress && (Object.keys(previous).length > 0) && (Object.keys(current).length === 0)) {
        context.api.sendNotification?.({
          type: "success",
          title: "Plugin Cleaning Completed",
          message: `${pluginBeingCleaned} was cleaned with xEdit.`, 
          group: "xEdit-cleaning-done",
          displayMS: 10000
        });
        context.api.store?.dispatch(session.SET_CLEANING_PLUGIN(false, undefined));
        log("debug", "xEdit plugin cleaning completed");
      }
    });

  });
}

function isSupportedGame(context: types.IExtensionContext): boolean {
  const activeGameId = selectors.activeGameId(context.api.getState());
  return !!gameSupportData[activeGameId];
}



export default init;
