import { connect } from 'react-redux'
import { toggleFollow, toggleToolbar } from '../actions'
import Toolbar from '../components/Toolbar'

const mapStateToProps = state => ({
    app: state.app,
    toolbar: state.toolbar
})

const mapDispatchToProps = dispatch => ({
    onFollowClick: () => dispatch(toggleFollow()),
    onToggleClick: () => dispatch(toggleToolbar())
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Toolbar)