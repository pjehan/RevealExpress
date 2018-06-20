const toolbar = (state = {follow: false, show: false}, action) => {
    switch (action.type) {
        case 'TOGGLE_TOOLBAR':
            return {...state, show: !state.show}
        case 'TOGGLE_FOLLOW':
            return {...state, follow: !state.follow}
        default:
            return state
    }
}

export default toolbar