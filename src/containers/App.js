import { connect } from 'react-redux'
import { createSocket, setConfig } from "../actions"
import App from '../components/App'

const mapStateToProps = state => ({
    socket: state.app.socket
});

const mapDispatchToProps = dispatch => ({
    setConfig: config => dispatch(setConfig(config)),
    createSocket: socket => dispatch(createSocket(socket))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);
