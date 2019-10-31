import { actions, log, selectors, types, util } from 'vortex-api';
import { genxEditAttribute } from './attributes';


export const gameSupportData = [
  {
    game: "skyrimse",
    exeName: "SSEEdit",
    gameParam: "-sse"
  },
  {
    game: "skyrim",
    exeName: "TES5Edit",
    gameParam: "-tes5"
  },
  {
    game: "skyrimvr",
    exeName: "TES5VREdit",
    gameParam: "-tes5vr"
  },
  {
    game: "fallout4",
    exeName: "FO4Edit",
    gameParam: "-fo4vr"
  },
  {
    game: "oblivion",
    exeName: "TES4Edit",
    gameParam: "-tes4"
  },
  {
    game: "enderal",
    exeName: "EnderalEdit",
    gameParam: "-enderal"
  },
  {
    game: "fallout3",
    exeName: "FO3Edit",
    gameParam: "-fo3"
  },
  {
    game: "falloutnv",
    exeName: "FNVEdit",
    gameParam: "-fnv"
  },
  {
    game: "fallout4vr",
    exeName: "FO4VREdit",
    gameParam: "-fo4vr"
  },
  {
    game: "fallout76",
    exeName: "FO76Edit",
    gameParam: "-fo76"
  },
  {
    game: "morrowind",
    exeName: "TES3Edit",
    gameParam: "-tes3"
  },
];

//export a list of plugins we don't want to clean, ever.
export const excludedPlugins = ["skyrim.esm", "fallout4.esm", "falloutnv.esm", "fallout3.esm"," oblivion.esm", "seventysix.esm", "enderal - forgotten stories.esm"];

//do not clean messages from LOOT in all possible localisations.
export const doNotCleanMessages = [
'Do not clean ITM records, they are intentional and required for the mod to function. It is safe to undelete records, but do not do anything other than that.',
'Rengør ikke ITM-poster: de er forsætlige og krævede for at mod’en fungerer. Det er sikkert at gendanne poster, men gør ikke andet end dét.',
'ITM-Einträge in diesem Plugin sollten nicht gesäubert werden, sie sind absichtlich enthalten und werden benötigt, damit die Mod richtig funktioniert. Gelöschte Einträge wiederherzustellen ist in Ordnung, alles andere aber nicht.',
'No limpiar las referencias ITM (iguales al master), ya que son intencionales y necesarias para que el Mod funcione. Sí es seguro restaurar las UDR (referencias borradas), pero no haga más que eso.',
'IMTレコードはクリーンしないでください。これらは意図的に残されたデータであり、Modを機能させるために必要です。削除の取り消しは安全に行えますが、それ以外のことは行わないでください。',
'ITM 자료를 삭제하지 마십시오. 모드가 정상 작동하기 위해 의도적으로 남겨진 자료입니다. 삭제를 취소하는 것 이외에는 안전하지 않습니다.',
'Nie czyść rekordów ITM, są one zamierzone i potrzebne do działania tego moda. Jest bezpieczne aby cofnąć usunięcie rekordów (UDR), ale nie rób nic innego ponad to. ',
'Não apagar os registos ITM. São intencionais e necessárias para o funcionamento do mod. É seguro restaurar os registos, mas não faça nada mais que isso.',
'Não apague os registros ITM. Eles são intencionais e necessários para que o mod funcione. É seguro restaurar os registros, mas nada mais além disso.',
'Не очищать ITM-записи. "Грязные" правки оставлены специально и требуются для функционирования мода. Восстановить удаленные записи (UDR) можно безопасно, но идентичные мастерфайлу лучше оставить.',
'Städa inte bort ITM records, de är avsiktliga och krävs för att modden ska fungera. Det är säkert att återställa records, men gör ingenting förutom det.',
'不干净。"脏"数据是故意的，这是mod需要的功能。'
];

let cleaningInProgress = false;
let pluginBeingCleaned = "";

export function setCleaning(status: boolean, pluginName: string = "") {
  cleaningInProgress = status;
  pluginBeingCleaned = pluginName;
}

function init(context: types.IExtensionContext) {
  //Is this required?
  context.requireExtension('gamebryo-plugin-management');

  //Table attribute may be redundant once the context menu works?
  context.registerTableAttribute('gamebryo-plugins', genxEditAttribute(context.api));

  //Does not currently work, Tannin is aware. 
  context.registerAction('gamebryo-plugin-action-icons', 300, 'xEdit', {}, 'Clean with xEdit',
    instanceIds => {
        return xEditQuickAutoClean(instanceIds, context.api);
        }, 
        instanceIds => {
          const activeGameId = selectors.activeGameId(context.api.store.getState());
          return gameSupportData.find(g => g.game === activeGameId) ? true : false;
        });
  
  //Does not currently work, Tannin is aware. 
  // context.registerAction('gamebryo-plugin-multirow-actions', 300, 'xEdit', {}, 'Clean with xEdit',
  //   instanceIds => {
  //       //Probably don't want this as a batch action, but will leave it here for now. 
  //       console.log("xEdit multi button, yay!");
  //       return true;
  //       }, 
  //       instanceIds => {
  //         const activeGameId = selectors.activeGameId(context.api.store.getState());
  //         return gameSupportData.find(g => g.game === activeGameId) ? true : false;
  //       });
  
  context.once(() => {
    //Woohoo! New Icon!
    util.installIconSet('xedit-icons', `${__dirname}/xediticon.svg`);
    
    //We want to react to xEdit closing once we launch it.   
    context.api.onStateChange(['session', 'base', 'toolsRunning'], async (previous, current) => {
      if (cleaningInProgress && (Object.keys(previous).length > 0) && (Object.keys(current).length === 0)) {
        context.api.sendNotification({
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

export function xEditQuickAutoClean(pluginName, api) {
  const store = api.store
  const activeGameId = selectors.activeGameId(store.getState());

  //Get Data about our plugin
  const pluginData = util.getSafe(store.getState(), ['session', 'plugins', 'pluginInfo', pluginName.toLowerCase()], undefined);
  const lootMessages = pluginData.messages;
  const doNotCleanMessage = lootMessages.find(m => doNotCleanMessages.includes(m.value));
  const missingMaster = pluginData.warnings['missing-master'];
  //We can't clean the game ESMs.
  if (doNotCleanMessage) return api.showErrorNotification(`Cannot clean this plugin`,`Vortex could not clean ${pluginData.name} as it is the game master file.`);
  //We can't clean plugins with missing masters. 
  if (missingMaster) return api.showErrorNotification(`Cannot clean this plugin`,`Vortex could not clean ${pluginData.name} as it has missing masters.`);

  const xEditData = gameSupportData.find(g => g.game === activeGameId);
  const gamePath = util.getSafe(store.getState(), ['settings', 'gameMode', 'discovered', activeGameId, 'path'], undefined);
   
  const tools = util.getSafe(store.getState(), ['settings', 'gameMode', 'discovered', activeGameId, 'tools'], undefined);
  const xEditKey = Object.keys(tools).find(t => t === xEditData.exeName);
  const xEditTool : types.IDiscoveredTool = tools[xEditKey];

  if (!xEditTool || !xEditTool.path) return api.showErrorNotification(`xEdit not found`,`Vortex could not find ${xEditData.exeName}. Please check the tool in your starter dashlet is pointing to the right place.`);

  api.runExecutable(xEditTool.path, [xEditData.gameParam, "-quickautoclean", "-autoexit", "-autoload", pluginName],{
    cwd: gamePath,
    env: "",
    suggestDeploy: false,
    shell: false,
    onSpawned: () => api.store.dispatch(actions.setToolRunning(xEditTool.path, Date.now(), true))
  }).then(
    //Set the flag so we know we're cleaning with this tool.
    setCleaning(true, pluginName)
  )
  .catch(err => {
    if (err.errno === 'ENOENT') {
      api.showErrorNotification(`xEdit not found`,`Failed to run tool. Vortex could not find xEdit at ${xEditTool.path}. Please check the tool in your starter dashlet is pointing to the right place.`);
    } else console.log(err);
  });
}


export default init;
