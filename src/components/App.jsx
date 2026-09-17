import React from 'react'
import io from 'socket.io-client'
import Toolbar from '../containers/Toolbar'
import Slideshow from '../containers/Slideshow'

class App extends React.Component {

  componentDidMount() {
    fetch(window.location.protocol + '//' + window.location.host + '/config')
      .then(response => response.json())
      .then(config => {
        this.props.setConfig(config);
        const socket = io.connect(window.location.hostname + ':' + config.portws);
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
