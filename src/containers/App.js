import { connect } from 'react-redux'
import { createSocket, setUserMode, setConfig } from "../actions"
import App from '../components/App'

const mapStateToProps = state => ({
    socket: state.app.socket
});

const mapDispatchToProps = dispatch => ({
    setConfig: config => dispatch(setConfig(config)),
    createSocket: socket => dispatch(createSocket(socket)),
    setUserMode: mode => dispatch(setUserMode(mode))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
