import React, { useCallback, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Jumbotron from '../Jumbotron';

const Join = () => {
    const navigate = useNavigate();

    const [input, setInput] = useState({
        memberId: "",
        memberPw: "",
        memberName: "",
        memberEmail: "",
        memberContact: "",
        memberPost: "",
        memberAddress1: "",
        memberAddress2: ""
    });

    const [display, setDisplay] = useState(false);

    const changeInput = useCallback((e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value 
        });
    }, [input]);

    const joinRequest = useCallback(async () => {
        
            const resp = await axios.post("http://localhost:8080/member/join", input);
            console.log( resp.data);
            navigate("/");
         
    }, [input, navigate]);

    return (
        <>
            <div className='row'>
                <div className='col-md-6 offset-md-3'>
                    <Jumbotron title="회원가입" />

                    <div className='row mt-4'>
                        <div className='col'>
                            <input type='text' name='memberId'
                                className='form-control' placeholder='아이디'
                                value={input.memberId}
                                onChange={changeInput}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input
                                type={display ? "text" : "password"}
                                name="memberPw"
                                className="form-control"
                                placeholder="비밀번호 입력"
                                value={input.memberPw}
                                onChange={changeInput}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type='text' name='memberName'
                                className='form-control' placeholder='이름'
                                value={input.memberName}
                                onChange={changeInput}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type='email' name='memberEmail'
                                className='form-control' placeholder='이메일'
                                value={input.memberEmail}
                                onChange={changeInput}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type='text' name='memberContact'
                                className='form-control' placeholder='연락처'
                                value={input.memberContact}
                                onChange={changeInput}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type='text' name='memberPost'
                                className='form-control' placeholder='우편번호'
                                value={input.memberPost}
                                onChange={changeInput}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type='text' name='memberAddress1'
                                className='form-control' placeholder='주소 1'
                                value={input.memberAddress1}
                                onChange={changeInput}
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type='text' name='memberAddress2'
                                className='form-control' placeholder='주소 2'
                                value={input.memberAddress2}
                                onChange={changeInput}
                            />
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col">
                            <label>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={display}
                                    onChange={e => setDisplay(e.target.checked)}
                                />
                                <span className="form-check-label ms-2">비밀번호 표시</span>
                            </label>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col">
                            <button
                                className="btn btn-success w-100"
                                onClick={joinRequest}
                            >
                                회원 가입
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Join;
