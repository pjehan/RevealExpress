import React from 'react'

class Toolbar extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        let tools = null;

        if (this.props.app.mode === 'spectator') {
            tools = (
                <div className="form-group">
                    <label>Suivre :</label>
                    <label className="switch">
                        <input type="checkbox" defaultChecked={this.props.toolbar.follow} onChange={() => this.props.onFollowClick()}/>
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
                            <p>{this.props.app.mode}</p>
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