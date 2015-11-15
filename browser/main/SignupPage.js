import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import linkState from 'boost/linkState'
import openExternal from 'boost/openExternal'
import { signup } from 'boost/api'
import auth from 'boost/auth'

export default class SignupContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      user: {},
      connectionFailed: false,
      emailConflicted: false,
      nameConflicted: false,
      validationFailed: false,
      isSending: false,
      error: null
    }
    this.linkState = linkState
    this.openExternal = openExternal
  }

  handleSubmit (e) {
    this.setState({
      isSending: true,
      error: null
    }, function () {
      signup(this.state.user)
        .then(res => {
          let { user, token } = res.body
          auth.user(user, token)

          this.props.history.pushState('home')
        })
        .catch(err => {
          console.error(err)
          if (err.code === 'ECONNREFUSED') {
            return this.setState({
              error: {
                name: 'CunnectionRefused',
                message: 'Can\'t connect to API server.'
              },
              isSending: false
            })
          } else if (err.status != null) {
            return this.setState({
              error: {
                name: err.response.body.name,
                message: err.response.body.message
              },
              isSending: false
            })
          }
          else throw err
        })
    })

    e.preventDefault()
  }

  render () {
    return (
      <div className='SignupContainer'>
        <img className='logo' src='../../resources/favicon-230x230.png'/>

        <nav className='authNavigator text-center'><Link to='/login' activeClassName='active'>Log In</Link> / <Link to='/signup' activeClassName='active'>Sign Up</Link></nav>

        <form onSubmit={e => this.handleSubmit(e)}>
          <div className='formField'>
            <input valueLink={this.linkState('user.email')} type='text' placeholder='E-mail'/>
          </div>
          <div className='formField'>
            <input valueLink={this.linkState('user.password')} type='password' placeholder='Password'/>
          </div>
          <div className='formField'>
            <input valueLink={this.linkState('user.name')} type='text' placeholder='name'/>
          </div>
          <div className='formField'>
            <input valueLink={this.linkState('user.profileName')} type='text' placeholder='Profile name'/>
          </div>

          {this.state.isSending ? (
            <p className='alertInfo'>Signing up...</p>
          ) : null}

          {this.state.error != null ? <p className='alertError'>{this.state.error.message}</p> : null}

          <div className='formField'>
            <button className='logInButton' type='submit'>Sign Up</button>
          </div>
        </form>

        <p className='alert'>会員登録することで、<a onClick={this.openExternal} href='http://boostio.github.io/regulations.html'>当サイトの利用規約</a>及び<a onClick={this.openExternal} href='http://boostio.github.io/privacypolicies.html'>Cookieの使用を含むデータに関するポリシー</a>に同意するものとします。</p>
      </div>
    )
  }
}

SignupContainer.propTypes = {
  history: PropTypes.shape({
    pushState: PropTypes.func
  })
}