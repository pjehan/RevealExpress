import React from 'react'

class Toolbar extends React.Component {

  handleChangeMode(mode) {
    if (mode === 'presenter') {
      const password = prompt('Password:');
      fetch(window.location.protocol + '//' + window.location.host + '/check-password/' + password)
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            this.props.setUserMode(mode);
          }
        })
    } else {
      this.props.setUserMode(mode);
    }
  }

  render() {
    let tools = null;

    if (this.props.app.mode === 'spectator') {
      tools = (
        <div className="form-group">
          <label>Auto slide :</label>
          <label className="switch">
            <input type="checkbox" defaultChecked={this.props.toolbar.follow}
                   onChange={() => this.props.onFollowClick()}/>
            <span className="slider round"></span>
          </label>
        </div>
      )
    }


    return (
      <div id="toolbar">
        <div className={"tools " + (this.props.toolbar.show ? "show" : "")}>
          <form>
            <div className="form-group">
              <label>Mode :</label>
              <select value={this.props.app.mode} onChange={event => this.handleChangeMode(event.target.value)}>
                <option value="spectator">Spectator</option>
                <option value="presenter">Presenter</option>
              </select>
            </div>
            {tools}
          </form>
        </div>
        <div className="btn-show-tools">
          <i className='fa fa-arrow-circle-down' onClick={() => this.props.onToggleClick()}></i>
        </div>
      </div>
    )
  }
}

export default Toolbar
