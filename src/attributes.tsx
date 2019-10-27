import XEditButton from './views/XEditButton';
import { types, selectors } from 'vortex-api';
import * as I18next from 'i18next';
import * as Redux from 'redux';
import * as React from 'react';
import { excludedPlugins } from './index';

export function genxEditAttribute(api: types.IExtensionApi): types.ITableAttribute {
    return {
        id: 'xeditclean',
        name: 'xEdit',
        description: 'Perform a quick action with xEdit.',
        icon: 'external-link',
        customRenderer: (plugin, detail, t) => {
            //Check this plugin isn't one of the main master files.
            const res = excludedPlugins.indexOf(plugin.name.toLowerCase()) === -1
            ? renderxEditButton(api, api.store, plugin, t) 
            : null;
            return res;
        },
        calc: () => undefined,
        placement: 'detail',
        isToggleable: false,
        edit: {},
        isSortable: false,
        isVolatile: true
    }
};

function renderxEditButton(
    api: types.IExtensionApi,
    store: Redux.Store<any>,
    plugin, //Is it possible to import IPlugin from the gamebyro management extension? 
    t: I18next.TFunction) {
        const gameMode = selectors.activeGameId(store.getState());
        return (
            <XEditButton
            pluginName={plugin.name}
            lootMessages={plugin.messages}
            activeGameId={gameMode}
            warnings={plugin.warnings}
            t={t}
            store={store}
            api={api}
            />
        );
    }