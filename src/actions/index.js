export const setConfig = config => ({
    type: 'SET_CONFIG',
    config: config
});

export const toggleToolbar = () => ({
    type: 'TOGGLE_TOOLBAR'
});

export const toggleFollow = () => ({
    type: 'TOGGLE_FOLLOW'
});

export const createSocket = socket => ({
    type: 'CREATE_SOCKET',
    socket: socket
});

export const setUserMode = mode => ({
    type: 'SET_USER_MODE',
    mode: mode
});
