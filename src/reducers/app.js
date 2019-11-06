const app = (state = {config: null, socket: null, mode: 'spectator'}, action) => {
    switch (action.type) {
        case 'SET_CONFIG':
            return {...state, config: action.config};
        case 'CREATE_SOCKET':
            return {...state, socket: action.socket};
        case 'SET_USER_MODE':
            return {...state, mode: action.mode};
        default:
            return state
    }
};

export default app
