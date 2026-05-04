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
    gameParam: "-fo4"
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

export const xEditParams = {
  "quickautoclean" : ["{gamePara}", "-quickautoclean", "-autoexit", "-autoload", "{pluginName}"],
  "autoloadplugin" : ["{gamePara}", "-quickedit:{pluginName}"],
  "autoloadall" : ["{gamePara}", "-autoload"]
};