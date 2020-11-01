import React, { Component } from 'react';
import axios from 'axios';
import cookie from 'react-cookies';

const token = cookie.load('token');

export default class Landing extends Component {
    async componentDidMount() {
        await axios.get('http://localhost:5000/user')
        .then(res => {
            (res.data).forEach(i => {
                if(i.token === token){
                    window.location = "/dashboard";
                }
            })
        })
        .catch(err => console.log(err));
    }
    constructor(props) {
        super(props);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangePassword2 = this.onChangePassword2.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.state = {
            "username" : "",
            "password" : "",
            "password2" : "",
        }
    }
    onChangeUsername(e){
        this.setState({
            username: e.target.value
        });
    }
    onChangePassword(e){
        this.setState({
            password: e.target.value
        });
    }
    onChangePassword2(e){
        this.setState({
            password2: e.target.value
        })
    }
    onSubmit(e){
        e.preventDefault();
        var randomToken = require('random-token').create('~!@#$%^&*()_+=-\/1234567890abcdefghijklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        var token = randomToken(80);
        const newUser = {
            username: this.state.username,
            password: this.state.password,
            token: token,
        }
        console.log(newUser);
        axios.post('http://localhost:5000/user/register', newUser)
        .then(res => {
            cookie.save('token', token, {path: '/'});
            window.location = '/';
        })
        .catch(err => console.log(err));
    }
    render() { 
        return (
            <section id="landing">
                <div className="container" style={{ fontFamily:'Itim' }}>
                    <div className="row">
                        <div className="col-lg-7 col-md-7 col-sm-12" style={{ marginTop:'45vh' }}>
                            <h1>
                                Welcome to
                                <br/>
                                Todo App MERN
                                <br/>
                                Author : <a href="http://stanleyowen.atwebpages.com" rel="noreferrer" target="_blank">Stanley Owen</a>
                            </h1>
                        </div>
                        <div className="col-lg-5 col-md-5 col-sm-12" style={{ marginTop: '30vh' }}>
                            <h2><i><b>Register</b></i><br/>Your Account Now</h2>
                            <br/><br/>
                            {this.state.password !== this.state.password2 ? (<div className="p-3 mb-2 bg-danger text-white">Please Make Sure Both Password are Match!</div>) : null}
                            <form onSubmit={this.onSubmit}>
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><i className="fas fa-user"></i></span>
                                    </div>
                                    <input type="text" className="form-control" onChange={this.onChangeUsername} placeholder="Username" value={this.state.username} required/>
                                </div>
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                    </div>
                                    <input type="password" className="form-control" onChange={this.onChangePassword} placeholder="Password" value={this.state.password} required/>
                                </div>
                                <div className="input-group mb-3">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text"><i className="fas fa-lock"></i></span>
                                    </div>
                                    <input type="password" className="form-control" onChange={this.onChangePassword2} placeholder="Confirm Password" value={this.state.password2} required/>
                                </div>
                                <input type="submit" value="Register" className="btn btn-outline-primary" onChange=""style={{ width: '100%' }} />
                            </form>    
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}