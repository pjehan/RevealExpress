import React from 'react'
import io from 'socket.io-client'
import Toolbar from '../containers/Toolbar'
import Slideshow from '../containers/Slideshow'

class App extends React.Component {

    constructor(props) {
        super(props)

        const socket = io.connect(window.location.hostname + ':3001')
        const findIP = new Promise(r => {var w = window,a = new (w.RTCPeerConnection || w.mozRTCPeerConnection || w.webkitRTCPeerConnection)({iceServers: []}),b = () => {};a.createDataChannel("");a.createOffer(c => a.setLocalDescription(c, b, b), b);a.onicecandidate = c => {try {c.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g).forEach(r)} catch (e) {}}})

        this.props.createSocket(socket)
        findIP.then(ip => {
            this.props.setUserMode(window.location.hostname === ip ? 'presenter' : 'spectator')
        })
    }

    render() {
        return (
            <React.Fragment>
                <Toolbar/>
                <Slideshow/>
            </React.Fragment>
        );
    }
}

export default App;