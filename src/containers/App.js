import { connect } from 'react-redux'
import { createSocket, setUserMode } from "../actions"
import App from '../components/App'

const mapStateToProps = state => ({})

const mapDispatchToProps = dispatch => ({
    createSocket: (socket) => dispatch(createSocket(socket)),
    setUserMode: (mode) => dispatch(setUserMode(mode))
})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App)