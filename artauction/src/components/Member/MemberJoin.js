import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Jumbotron from '../Jumbotron';
import axios from 'axios';

const MemberJoin = () => {
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

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const changeInput = useCallback((e) => {
        setInput(prevInput => ({
            ...prevInput,
            [e.target.name]: e.target.value 
        }));
    }, []);

    const joinRequest = useCallback(async () => {
        try {
            const resp = await axios.post("http://localhost:8080/member/join", input);
            console.log(resp.data);
            navigate("/");
        } catch (error) {
            console.error("회원 가입 요청 중 오류:", error);
        }
    }, [input, navigate]);

    const sample6_execDaumPostcode = () => {
        if (!window.daum) {
            console.error("Daum Postcode API가 로드되지 않았습니다.");
            return;
        }

        new window.daum.Postcode({
            oncomplete: function(data) {
                const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                const extraAddr = data.userSelectedType === 'R' ? 
                    (data.bname ? data.bname : '') + (data.buildingName ? `, ${data.buildingName}` : '') : 
                    '';

                setInput(prevInput => ({
                    ...prevInput,
                    memberPost: data.zonecode,
                    memberAddress1: addr,
                    memberAddress2: extraAddr
                }));

                document.getElementById("sample6_detailAddress").focus(); // 상세주소 입력 필드에 포커스 이동
            }
        }).open();
    };

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
                            <input type='text' id="sample6_postcode" name='memberPost'
                                className='form-control' placeholder='우편번호'
                                value={input.memberPost}
                                readOnly
                            />
                            <input type="button" onClick={sample6_execDaumPostcode} value="우편번호 찾기" />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type='text' id="sample6_address" name='memberAddress1'
                                className='form-control' placeholder='주소'
                                value={input.memberAddress1}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type='text' id="sample6_detailAddress" name='memberAddress2'
                                className='form-control' placeholder='상세주소'
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

export default MemberJoin;
