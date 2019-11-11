import { ComponentEx, Icon, log, types } from 'vortex-api';

import * as I18next from 'i18next';
import * as React from 'react';
import { Button, InputGroup } from 'react-bootstrap';
import * as Redux from 'redux';
import { doNotCleanMessages } from '../index'; //xEditQuickAutoClean


export interface IProps {
  activeGameId: string;
  pluginName: string;
  lootMessages: string[];
  warnings: object;
  t: I18next.TFunction;
  store: Redux.Store<any>;
  api: types.IExtensionApi;
}

/**
 * XEditButton Detail
 *
 * @class XEditButton
 */
class XEditButton extends ComponentEx<IProps, {}> {
  public render(): JSX.Element {
    const { lootMessages, t, warnings } = this.props;
    //See if we have a "Do not clean" message from LOOT. If so, disable the button.
    const doNotCleanMessage = lootMessages.find(m => doNotCleanMessages.includes(m.value));
    const missingMaster = warnings['missing-master'];
    return (
      <div>
        <InputGroup.Button style={{ width: 'initial' }}>
        <Button onClick={this.launchxEditQuickAutoClean} disabled={doNotCleanMessage || missingMaster} title={
          missingMaster 
          ? t('Cleaning is unavailable due to missing masters.') 
          : doNotCleanMessage 
          ? t('Cleaning is unavailable, see LOOT messages.') 
          : t('Perform a Quick Auto Clean of this plugin with xEdit.')
        }><Icon name="xEdit"/> {t('Clean with xEdit')}</Button>
        </InputGroup.Button>
      </div>
    );
  }

  private launchxEditQuickAutoClean = async () => {
    const { api, activeGameId, pluginName } = this.props; 
    log(`debug`,`Pressed xEdit button for ${pluginName} in ${activeGameId}.`);
    //return xEditQuickAutoClean(pluginName, api);
  }
}

export default XEditButton;