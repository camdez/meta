var CONSTANTS = require('../constants');
var Dispatcher = require('../dispatcher');

function atUsername(user) {
  return '@' + user.username
}

function avatarUrl(user, size) {
  if (user) {
    return user.avatar_url + '?s=' + 48
  } else {
    return '/assets/default_avatar.png'
  }
}

var CoreTeam = React.createClass({
  getInitialState: function() {
    return { users: [], potentialUser: null }
  },

  render: function() {
    return (
      <table className="table">
        <tbody>
          <tr className="active">
            <td>
              <img alt={atUsername(this.props.currentUser)}
                   className="avatar img-circle"
                   height="24" width="24"
                   src={avatarUrl(this.props.currentUser, 48)} />
            </td>
            <td>{atUsername(this.props.currentUser)}</td>
            <td className="right-align">
              <span className="gray-2">(you)</span>
            </td>
          </tr>
          {this.rows()}
          <tr>
            <td>{this.state.potentialUser ? this.avatar(this.state.potentialUser) : this.avatar(null) }</td>
            <td>
              <PersonPicker ref="picker" url="/_es"
                            onUserSelected={this.handleUserSelected}
                            onValidUserChanged={this.handleValidUserChanged} />
            </td>
            <td className="right-align">
              {this.addButton()}
            </td>
          </tr>
        </tbody>
      </table>
    )
  },

  addButton: function() {
    if (this.state.potentialUser) {
      return (
        <a className="green" href="#" onClick={this.addUserClicked}>
          <span className="icon icon-plus-circled"></span>
          <span className="sr-only">Add</span>
        </a>
      )
    } else {
      return (
        <span className="green">
          <span className="icon icon-plus-circled"></span>
          <span className="sr-only">Add</span>
        </span>
      )
    }
  },

  rows: function(){
    return _.map(this.state.users, function(user){
      return <MemberRow user={user} onRemove={this.handleUserRemoved(user)} key={user.id || user.email} />
    }.bind(this))
  },

  handleUserSelected: function(user) {
    this.addUser(user)
  },

  handleUserRemoved: function(user) {
    return function() {
      var users = _.reject(this.state.users, function(u){
        if (u.id) {
          return u.id == user.id
        } else if (u.email) {
          return u.email == user.email
        }
      });

      this.setState({users: users});

      Dispatcher.dispatch({
        action: CONSTANTS.COIN_OWNERSHIP.ACTIONS.REMOVE_USER,
        data: { userAndCoins: user }
      });

    }.bind(this)
  },

  handleValidUserChanged: function(user) {
    this.setState({potentialUser: user})
  },

  addUserClicked: function(e) {
    e.preventDefault()
    this.addUser(this.state.potentialUser)
    this.refs.picker.clearText()
  },

  addUser: function(user) {
    this.setState(React.addons.update(this.state, {
      potentialUser: {$set: null},
      users: { $push: [user] }
    }))

    Dispatcher.dispatch({
      action: CONSTANTS.COIN_OWNERSHIP.ACTIONS.ADD_USER,
      data: { userAndCoins: user }
    });
  },

  avatar: function(user) {
    if (user && user.email) {
      return <span className="gray-2 glyphicon glyphicon-envelope"></span>
    } else {
      return <img className="avatar img-circle" height="24" src={avatarUrl(user)} width="24" />
    }
  }
})

function preventDefault(fn) {
  return function(e) {
    e.preventDefault()
    fn(e)
  }
}

var MemberRow = React.createClass({
  render: function(){
    if (this.props.user.email) {
      return (
        <tr>
          <td><span className="gray-2 glyphicon glyphicon-envelope"></span></td>
          <td>{this.props.user.email}</td>

          <td className="right-align">
            <input type="hidden" value={this.props.user.email} name="core_team[]" />
            <a href="#" onClick={preventDefault(this.props.onRemove)} className="gray-2 red-hover">
              <span className="icon icon-close"></span>
              <span className="sr-only">Remove</span>
            </a>
          </td>
        </tr>
      )
    } else {
      return (
        <tr>
          <td><img className="avatar" src={avatarUrl(this.props.user, 48)} width={24} height={24}/></td>
          <td>@{this.props.user.username}</td>

          <td className="right-align">
            <input type="hidden" value={this.props.user.id} name="core_team[]" />
            <a href="#" onClick={preventDefault(this.props.onRemove)} className="gray-2 red-hover">
              <span className="icon icon-close"></span>
              <span className="sr-only">Remove</span>
            </a>
          </td>
        </tr>
      )
    }
  }
});

module.exports = window.CoreTeam = CoreTeam;