import { connect } from 'react-redux'
import Slideshow from '../components/Slideshow'

const mapStateToProps = state => ({
    app: state.app,
    toolbar: state.toolbar
})

const mapDispatchToProps = dispatch => ({})

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Slideshow)