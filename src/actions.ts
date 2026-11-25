import { createAction } from 'redux-act';

const session = {
    "SET_CLEANING_PLUGIN": createAction("SET_CLEANING_PLUGIN", (active: boolean, name: string | undefined) => ({ active, name }))
};

const persistent = {
    "SET_EDIT_TOOL_BY_GAME": createAction("SET_EDIT_TOOL_BY_GAME", (gameId: string, toolId: string | undefined) => ({ gameId, toolId }))
};

export { session, persistent };