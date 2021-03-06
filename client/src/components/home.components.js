/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { setNotification, NOTIFICATION_TYPES } from '../library/setNotification';
import axios from 'axios';

const listLabel = ["Priority","Secondary","Important","Do Later"];
const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const DATE_VAL = /^(19|20|21)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/;
const EMAIL_VAL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const timestamps = () => {
    var today = new Date();
    var date = today.getDate();
    var month = today.getMonth() + 1;
    var year = today.getFullYear();
    if(date < 10) date = '0'+date;
    if(month < 10) month = '0'+month;
    return year+'-'+month+'-'+date;
}

const labeling = (a) => {
    var _labelClass = null;
    if(a[1]){if(a[0]+" "+a[1] === listLabel[3]) _labelClass="do-later"}
    else {
        if(a[0] === listLabel[0]) _labelClass="priority";
        else if(a[0] === listLabel[1]) _labelClass="secondary";
        else if(a[0] === listLabel[2]) _labelClass="important";
    }
    var _label = <span className={"label "+_labelClass}>{a}</span>;
    return _label;
}

const formatDate = (e) => {
    var a = e.split('-');
    return(a[2]+'-'+a[1]+'-'+a[0])
}

const Home = () => {
    const email = localStorage.getItem('__email');
    const token = localStorage.getItem('__token');
    const userId = localStorage.getItem('__id');
    const [todoData, setTodoData] = useState(null);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(timestamps);
    const [description, setDescription] = useState('');
    const [label, setLabel] = useState(listLabel[0].toLowerCase());

    async function getTodoData(){
        const email = localStorage.getItem('__email');
        const token = localStorage.getItem('__token');
        const userId = localStorage.getItem('__id');
        await axios.get(`${SERVER_URL}/data/todo/getData`, {params: {id: userId, email}, headers: { Authorization: `JWT ${token}` }})
        .then(res => setTodoData(res.data))
        .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
    }

    useEffect(() => {
        const modal = document.getElementById('addTodoModal');
        window.onclick = function(event){
            if(event.target === modal){
                modal.style.visibility = "hidden";
                modal.style.opacity = "0";
            }
        }
        document.querySelectorAll('[data-autoresize]').forEach(function (element) {
            element.style.boxSizing = 'border-box';
            var offset = element.offsetHeight - element.clientHeight;
            element.addEventListener('input', function (event) {
              event.target.style.height = '-10px';
              event.target.style.height = event.target.scrollHeight + offset + 'px';
            });
            element.removeAttribute('data-autoresize');
        });
        if(email && userId) getTodoData();
        else setInterval(getTodoData, 2000);
    }, []);

    function todoList() {
        if(todoData){
            return todoData.map(a => {
                return (
                <tr key={a._id}>
                    <td>{a.title}<br/>{a.description}</td>
                    <td>{labeling(titleCase(a.label))}</td>
                    <td>{formatDate(a.date.substring(10, 0))}</td>
                    <td><span className="btn-config"><a href={`/edit/${a._id}`}>Edit</a></span><span><a onClick={() => deleteData(a._id)}>Delete</a></span></td>
                </tr>)
            })
        }
    };

    const deleteData = async id => {
        const deleteData = { email, objId: id, id: userId }
        await axios.post(`${SERVER_URL}/data/todo/delete`, deleteData, { headers: { Authorization: `JWT ${token}` } })
        .then(res => setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message))
        .catch(err => setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message));
        getTodoData();
    }

    const titleCase = (a) => {
        var sentence = a.toLowerCase().split(" ");
        for (var i = 0; i < sentence.length; i++){ sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1); }
        sentence.join(" ");
        return sentence;
    }

    const closeModal = (e) => {
        e.preventDefault();
        const modal = document.getElementById('addTodoModal');
        modal.style.visibility = "hidden";
        modal.style.opacity = "0";
    }

    const submitTodo = (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-addTodo');
        btn.innerHTML = "Adding";
        async function submitData() {
            const modal = document.getElementById('addTodoModal');
            const todoData = { id: userId, email, title, label, description, date };
            await axios.post(`${SERVER_URL}/data/todo/add`, todoData, { headers: { Authorization: `JWT ${token}` } })
            .then(res => {
                setNotification(NOTIFICATION_TYPES.SUCCESS, res.data.message);
                modal.style.visibility = "hidden";
                modal.style.opacity = "0";
                setTitle('');
                setLabel(listLabel[0].toLowerCase());
                setDescription('');
                setDate(timestamps);
            })
            .catch(err => {
                console.log(err.response);
                setNotification(NOTIFICATION_TYPES.DANGER, err.response.data.message);
            });
            btn.removeAttribute("disabled");
            btn.classList.remove("disabled");
            btn.innerHTML = "Add";
            getTodoData();
        }
        if(!email || !token || EMAIL_VAL.test(String(email).toLocaleLowerCase()) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Sorry, we are not able to process your request. Please try again later.") }
        else if(!title || !date || !label){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Make Sure to Fill Out All Required the Fields !") }
        else if(title.length > 40){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Title less than 40 characters !") }
        else if(label.length > 20){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Label less than 20 characters !" ) }
        else if(description && description.length > 120){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Description Less than 120 characters !") }
        else if(date.length !== 10 || DATE_VAL.test(String(date)) === false){ setNotification(NOTIFICATION_TYPES.DANGER, "Please Provide a Valid Date !") }
        else { btn.setAttribute("disabled", "true"); btn.classList.add("disabled"); submitData(); }
    }
    return (
       <div className="main__projects">
           <p>Hi, Welcome Back {email}</p>
           <div id="addTodoModal" className="modal">
                <div className="modal__container">
                    <div className="modal__title">
                        <span className="modal__closeFireUI modal__closeBtn" onClick={closeModal}>&times;</span>
                        <h2>Add Todo</h2>
                    </div>
                    <div className="modal__body">
                        <form onSubmit={submitTodo}>
                            <div className="form__container">
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="title">Title <span className="required">*</span></label>
                                        <input title="Title" id="title" type="text" className="contact__inputField" onChange={(event) => setTitle(event.target.value)} value={title} required />
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                                <div className="contact__formControl">
                                    <div className="contact__infoField">
                                        <label htmlFor="label">Date <span className="required">*</span></label>
                                        <input type="date" className="contact__inputField datepicker" onChange={(event) => setDate(event.target.value)} value={date}></input>
                                        <span className="contact__onFocus"></span>
                                    </div>
                                </div>
                            </div>

                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="label">Label <span className="required">*</span></label>
                                    <select onChange={(event) => setLabel(event.target.value)} value={label}>
                                        { listLabel.map(c => {
                                            return (<option key={c.toLowerCase()} value={c.toLowerCase()}>{c}</option>)
                                        }) }
                                    </select>
                                </div>
                            </div>

                            <div className="contact__formControl">
                                <div className="contact__infoField">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" className="contact__inputField" data-autoresize rows="2" onChange={(event) => setDescription(event.target.value)} value={description}></textarea>
                                    <span className="contact__onFocus"></span>
                                </div>
                            </div>
                            <button type="submit" id="btn-addTodo" className="btn__outline" style={{outline: 'none'}}>Add</button>
                        </form>
                    </div>
                </div>
            </div>

            <table className="main__table">
                <thead>
                    <tr>
                        <th>Activity Name</th>
                        <th>Labels</th>
                        <th>Due Date</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {todoList()}
                    { !todoData ?
                        (<td colSpan="5" className="no-border"><div className="full-width spin-container">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                        <div className="shape shape-4"></div>
                    </div></td>) : null }
                </tbody>
            </table>

            
       </div>
    );
}

export default Home;