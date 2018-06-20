import { combineReducers } from 'redux'
import app from './app'
import toolbar from './toolbar'
import slideshow from './slideshow'

export default combineReducers({
    app,
    toolbar,
    slideshow
})