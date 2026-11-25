import { types } from "@nexusmods/vortex-api";
import { session, persistent } from './actions';

export const xEditSessionReducer: types.IReducerSpec = {
    reducers: {
        [session.SET_CLEANING_PLUGIN as any]: (state, payload) => {
            const { active, name } = payload;
            return { ...state, active, name };
        }
    },
    defaults: {
        active: false,
        name: undefined
    }
}

export const xEditPersistentReducer: types.IReducerSpec = {
    reducers: {
        [persistent.SET_EDIT_TOOL_BY_GAME as any]: (state, payload) => {
            const { gameId, toolId } = payload;
            if (toolId) return { ...state, [gameId]: undefined };
            else return { ...state, [gameId]: toolId };
        }
    },
    defaults: {}
};