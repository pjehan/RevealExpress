import React from 'react'
import io from 'socket.io-client'
import Toolbar from '../containers/Toolbar'
import Slideshow from '../containers/Slideshow'

class App extends React.Component {

    constructor(props) {
        super(props);

        const findIP = new Promise(r => {var w = window,a = new (w.RTCPeerConnection || w.mozRTCPeerConnection || w.webkitRTCPeerConnection)({iceServers: []}),b = () => {};a.createDataChannel("");a.createOffer(c => a.setLocalDescription(c, b, b), b);a.onicecandidate = c => {try {c.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g).forEach(r)} catch (e) {}}})
        findIP.then(ip => {
            this.props.setUserMode(window.location.hostname === ip ? 'presenter' : 'spectator')
        })
    }

    componentDidMount() {
        fetch('http://' + window.location.host + '/config/portws')
          .then(response => response.json())
          .then(port => {
              const socket = io.connect(window.location.hostname + ':' + port);
              this.props.createSocket(socket);
          })
    }

    render() {
        return (
            <React.Fragment>
                <Toolbar/>
                {this.props.socket ? <Slideshow/> : null}
            </React.Fragment>
        );
    }
}

export default App;
