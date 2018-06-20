const app = (state = {socket: null, mode: 'spectator'}, action) => {
    switch (action.type) {
        case 'CREATE_SOCKET':
            return {...state, socket: action.socket}
        case 'SET_USER_MODE':
            return {...state, mode: action.mode}
        default:
            return state
    }
}

export default app