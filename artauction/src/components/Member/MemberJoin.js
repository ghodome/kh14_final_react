import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Jumbotron from '../Jumbotron';
import axios from 'axios';
import { FaAsterisk } from 'react-icons/fa'; // FaAsterisk 아이콘 추가

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

    const [errors, setErrors] = useState({});
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
        setErrors(prevErrors => ({ ...prevErrors, [e.target.name]: undefined }));
    }, []);

    const validateInput = (field) => {
        const newErrors = {};
        switch (field) {
            case 'memberId':
                if (!input.memberId) {
                    newErrors.memberId = "아이디는 필수 입력입니다.";
                } else if (!/^[a-z][a-z0-9]{4,19}$/.test(input.memberId)) {
                    newErrors.memberId = "아이디는 5~20자, 소문자와 숫자만 포함해야 합니다.";
                }
                break;
            case 'memberPw':
                if (!input.memberPw) {
                    newErrors.memberPw = "비밀번호는 필수 입력입니다.";
                } else if (!/^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$])[A-Za-z0-9!@#$]{8,16}$/.test(input.memberPw)) {
                    newErrors.memberPw = "비밀번호는 8~16자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.";
                }
                break;
            case 'memberName':
                if (!input.memberName) {
                    newErrors.memberName = "이름은 필수 입력입니다.";
                }
                break;
            case 'memberEmail':
                if (!input.memberEmail) {
                    newErrors.memberEmail = "이메일은 필수 입력입니다.";
                } else if (!/\S+@\S+\.\S+/.test(input.memberEmail)) {
                    newErrors.memberEmail = "유효한 이메일 주소가 아닙니다.";
                }
                break;
            case 'memberContact':
                if (!input.memberContact) {
                    newErrors.memberContact = "연락처는 필수 입력입니다.";
                } else if (!/^010[1-9][0-9]{6,7}$/.test(input.memberContact)) {
                    newErrors.memberContact = "올바른 연락처 형식이 아닙니다.";
                }
                break;
            case 'memberPost':
                if (!input.memberPost) {
                    newErrors.memberPost = "우편번호는 필수 입력입니다.";
                }
                break;
            case 'memberAddress1':
                if (!input.memberAddress1) {
                    newErrors.memberAddress1 = "주소는 필수 입력입니다.";
                }
                break;
            case 'memberAddress2':
                if (!input.memberAddress2) {
                    newErrors.memberAddress2 = "상세주소는 필수 입력입니다.";
                }
                break;
            default:
                break;
        }
        return newErrors;
    };

    const checkIdDuplicate = useCallback(async () => {
        try {
            const value = input.memberId;
            if (!value) return;

            const resp = await axios.get(`/member/checkId`, {
                params: { memberId: value }
            });
            if (!resp.data) {
                setErrors(prev => ({
                    ...prev,
                    memberId: '아이디가 이미 사용 중입니다.'
                }));
            }
        } catch (error) {
            console.error(`아이디 중복 검사 중 오류 발생: ${error}`);
        }
    }, [input.memberId]);

    const checkNameDuplicate = useCallback(async () => {
        try {
            const value = input.memberName;
            if (!value) return;

            const resp = await axios.get(`/member/checkName`, {
                params: { memberName: value }
            });
            if (!resp.data) {
                setErrors(prev => ({
                    ...prev,
                    memberName: '이름이 이미 사용 중입니다.'
                }));
            }
        } catch (error) {
            console.error(`이름 중복 검사 중 오류 발생: ${error}`);
        }
    }, [input.memberName]);

    const handleBlur = async (field) => {
        const newErrors = { ...validateInput(field) };
        setErrors(prev => ({ ...prev, ...newErrors }));
    };
    const handleBlurMemberId = async () => {
        const newErrors = { ...validateInput('memberId') };
        setErrors(prev => ({ ...prev, ...newErrors }));
        await checkIdDuplicate();
    };

    const handleBlurMemberName = async () => {
        const newErrors = { ...validateInput('memberName') };
        setErrors(prev => ({ ...prev, ...newErrors }));
        await checkNameDuplicate();
    };

    const joinRequest = useCallback(async () => {
        const newErrors = {
            ...validateInput('memberId'),
            ...validateInput('memberPw'),
            ...validateInput('memberName'),
            ...validateInput('memberEmail'),
            ...validateInput('memberContact'),
            ...validateInput('memberPost'),
            ...validateInput('memberAddress1'),
            ...validateInput('memberAddress2')
        };

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const resp = await axios.post("/member/join", input);
            console.log(resp.data);
            navigate("/login");
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
            oncomplete: function (data) {
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

                document.getElementById("sample6_detailAddress").focus();
            }
        }).open();
    };

    return (
        <>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                <div className="row mt-4">
                <div className="col mb-4">
                    <span style={{ fontWeight: 'bold', fontSize: '50px' }}>회원가입</span>
                </div>
            </div>
                    <div className='row mt-4'>
                        <div className='col'>
                            <label className="form-label">아이디 <FaAsterisk style={{ color: 'red', fontSize: '0.7rem', verticalAlign: 'super', marginLeft: '0.2rem' }} /></label>
                            <input
                                type='text' name='memberId'
                                className='form-control rounded-0' placeholder='아이디'
                                value={input.memberId}
                                onChange={changeInput}
                                onBlur={handleBlurMemberId}
                            />
                            {errors.memberId && <div className="text-danger">{errors.memberId}</div>}
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <label className="form-label">비밀번호 <FaAsterisk style={{ color: 'red', fontSize: '0.7rem', verticalAlign: 'super', marginLeft: '0.2rem' }} /></label>
                            <input
                                type={display ? "text" : "password"}
                                name="memberPw"
                                className="form-control rounded-0"
                                placeholder="비밀번호 입력"
                                value={input.memberPw}
                                onChange={changeInput}
                                onBlur={() => handleBlur('memberPw')}
                            />
                            {errors.memberPw && <div className="text-danger">{errors.memberPw}</div>}
                            <label className="form-check-label" style={{ fontSize: '1rem' }}>
                                <input
                                    type="checkbox"
                                    className="form-check-input rounded-0"
                                    checked={display}
                                    onChange={e => setDisplay(e.target.checked)}
                                />
                                비밀번호 표시
                            </label>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <label className="form-label">이름 <FaAsterisk style={{ color: 'red', fontSize: '0.7rem', verticalAlign: 'super', marginLeft: '0.2rem' }} /></label>
                            <input
                                type='text' name='memberName'
                                className='form-control rounded-0' placeholder='이름'
                                value={input.memberName}
                                onChange={changeInput}
                                onBlur={handleBlurMemberName}
                            />
                            {errors.memberName && <div className="text-danger">{errors.memberName}</div>}
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <label className="form-label">이메일 <FaAsterisk style={{ color: 'red', fontSize: '0.7rem', verticalAlign: 'super', marginLeft: '0.2rem' }} /></label>
                            <input type='email' name='memberEmail'
                                className='form-control rounded-0' placeholder='이메일'
                                value={input.memberEmail}
                                onChange={changeInput}
                                onBlur={() => handleBlur('memberEmail')}
                            />
                            {errors.memberEmail && <div className="text-danger">{errors.memberEmail}</div>}
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <label className="form-label">연락처 <FaAsterisk style={{ color: 'red', fontSize: '0.7rem', verticalAlign: 'super', marginLeft: '0.2rem' }} /></label>
                            <input type='text' name='memberContact'
                                className='form-control rounded-0' placeholder='연락처'
                                value={input.memberContact}
                                onChange={changeInput}
                                onBlur={() => handleBlur('memberContact')}
                            />
                            {errors.memberContact && <div className="text-danger">{errors.memberContact}</div>}
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <label className="form-label">우편번호 <FaAsterisk style={{ color: 'red', fontSize: '0.7rem', verticalAlign: 'super', marginLeft: '0.2rem' }} /></label>
                            <div className="input-group">
                                <input
                                    type='text'
                                    id="sample6_postcode"
                                    name='memberPost'
                                    className='form-control rounded-0'
                                    placeholder='우편번호'
                                    value={input.memberPost}
                                    readOnly
                                    style={{ width: '200px', flex: '0 0 auto' }} // 너비 조정 및 flex 속성 추가
                                />
                                <button
                                    type="button"
                                    onClick={sample6_execDaumPostcode}
                                    className="btn btn-dark rounded-0"
                                    style={{ marginLeft: '-1px' }} // 버튼과의 간격 조정
                                >
                                    찾기
                                </button>
                            </div>
                            {errors.memberPost && <div className="text-danger">{errors.memberPost}</div>}
                        </div>
                    </div>


                    <div className="row mt-4">
                        <div className="col">
                            <label className="form-label">주소 <FaAsterisk style={{ color: 'red', fontSize: '0.7rem', verticalAlign: 'super', marginLeft: '0.2rem' }} /></label>
                            <input type='text' id="sample6_address" name='memberAddress1'
                                className='form-control rounded-0' placeholder='주소'
                                value={input.memberAddress1}
                                readOnly
                            />
                            {errors.memberAddress1 && <div className="text-danger">{errors.memberAddress1}</div>}
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <label className="form-label">상세주소 <FaAsterisk style={{ color: 'red', fontSize: '0.7rem', verticalAlign: 'super', marginLeft: '0.2rem' }} /></label>
                            <input type='text' id="sample6_detailAddress" name='memberAddress2'
                                className='form-control rounded-0' placeholder='상세주소'
                                value={input.memberAddress2}
                                onChange={changeInput}
                                onBlur={() => handleBlur('memberAddress2')}
                            />
                            {errors.memberAddress2 && <div className="text-danger">{errors.memberAddress2}</div>}
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <button
                                className="btn btn-dark w-100 rounded-0"
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
