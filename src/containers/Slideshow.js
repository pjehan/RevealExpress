import { connect } from 'react-redux';
import Slideshow from '../components/Slideshow';

const mapStateToProps = state => ({
    socket: state.app.socket,
    mode: state.app.mode,
    config: state.app.config,
    toolbar: state.toolbar
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Slideshow)
