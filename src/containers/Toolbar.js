import { connect } from 'react-redux'
import { toggleFollow, toggleToolbar, setUserMode } from '../actions'
import Toolbar from '../components/Toolbar'

const mapStateToProps = state => ({
    app: state.app,
    toolbar: state.toolbar
})

const mapDispatchToProps = dispatch => ({
    onFollowClick: () => dispatch(toggleFollow()),
    onToggleClick: () => dispatch(toggleToolbar()),
    setUserMode: mode => dispatch(setUserMode(mode))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Toolbar)
