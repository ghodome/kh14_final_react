import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import axios from "axios";

Modal.setAppElement('#root');

const MemberUpdate = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState({
        memberId: "",
        memberPw: "",
        memberName: "",
        memberEmail: "",
        memberContact: "",
        memberPost: "",
        memberAddress1: "",
        memberAddress2: ""
    });

    const [currentPw, setCurrentPw] = useState("");
    const [isPwValid, setIsPwValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태 추가
    const [isEditing, setIsEditing] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(true);

    useEffect(() => {
        loadMember();
        loadDaumPostcode();
    }, []);

    const loadDaumPostcode = () => {
        const script = document.createElement("script");
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        document.body.appendChild(script);
    };

    const loadMember = useCallback(async () => {
        try {
            const resp = await axios.get("http://localhost:8080/member/find");
            setMember(resp.data[0]);
        } catch (error) {
            console.error("Failed to load member data:", error);
            navigate("/login");
        }
    }, [navigate]);

    const changeInput = useCallback(e => {
        const { name, value } = e.target;
        setMember(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleCurrentPwChange = useCallback(e => {
        setCurrentPw(e.target.value);
        setIsPwValid(true); // 비밀번호 입력 시 유효성 상태 초기화
        setErrorMessage(""); // 에러 메시지 초기화
    }, []);

    const handlePasswordSubmit = async () => {
        try {
            const resp = await axios.post("http://localhost:8080/member/verfiyPw", null, {
                params: {
                    memberId: member.memberId,
                    memberPw: currentPw
                }
            });

            if (!resp.data) {
                setIsPwValid(false);
                setErrorMessage("비밀번호가 일치하지 않습니다."); // 에러 메시지 설정
                return;
            }

            setIsEditing(true);
            setModalIsOpen(false); // 비밀번호 확인 후 모달 닫기
        } catch (error) {
            setErrorMessage("비밀번호를 입력해주세요."); // 입력 요청 메시지
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!window.confirm("정말 수정하시겠습니까?")) {
            return;
        }

        try {
            const updateMember = {
                memberId: member.memberId,
                memberPw: member.memberPw || undefined,
                memberName: member.memberName || undefined,
                memberEmail: member.memberEmail || undefined,
                memberContact: member.memberContact || undefined,
                memberPost: member.memberPost || undefined,
                memberAddress1: member.memberAddress1 || undefined,
                memberAddress2: member.memberAddress2 || undefined,
            };

            await axios.patch("http://localhost:8080/member/update", updateMember);
            alert("회원 정보가 수정되었습니다.");
            navigate("/member/mypage");
        } catch (error) {
            alert("수정 중 오류가 발생했습니다.");
        }
    };

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

                setMember(prev => ({
                    ...prev,
                    memberPost: data.zonecode,
                    memberAddress1: addr,
                    memberAddress2: extraAddr
                }));
            }
        }).open();
    };

    // 엔터키 눌렀을 때 비밀번호 인증 수행
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handlePasswordSubmit();
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-md-4 offset-md-4 col-12">
                    <div className="row mt-4">
                        <div className="col mb-4">
                            <span style={{ fontWeight: 'bold', fontSize: '2.5rem' }}>
                                {`${member[0]?.memberName || ''} 님의 정보수정`}
                            </span>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: isEditing ? 'block' : 'none' }}>
                        <div className="mb-3">
                            <input type="text"
                                name="memberName"
                                value={member.memberName}
                                onChange={changeInput}
                                placeholder="이름"
                                className="form-control rounded-0"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="email"
                                name="memberEmail"
                                value={member.memberEmail}
                                onChange={changeInput}
                                placeholder="이메일"
                                className="form-control rounded-0"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberContact"
                                value={member.memberContact}
                                onChange={changeInput}
                                placeholder="전화번호"
                                className="form-control rounded-0"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberPost"
                                value={member.memberPost}
                                placeholder="우편번호"
                                className="form-control rounded-0 md-4"
                                readOnly
                            />
                            <button type="button" onClick={sample6_execDaumPostcode} className="btn btn-dark mt-2 rounded-0">우편번호 찾기</button>
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberAddress1"
                                value={member.memberAddress1}
                                onChange={changeInput}
                                placeholder="일반주소"
                                className="form-control rounded-0"
                                readOnly
                            />
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberAddress2"
                                value={member.memberAddress2}
                                onChange={changeInput}
                                placeholder="상세주소"
                                className="form-control rounded-0"
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-dark rounded-0 mt-3" style={{ width: "25%", height: '40px' }}>수정 완료</button>
                            <button type="button" className="btn btn-secondary rounded-0" style={{ width: "25%", height: '40px' }} onClick={() => navigate(`/member/mypage`)}>
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* 비밀번호 확인 모달 */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => { }} // 배경 클릭 시 모달 닫히지 않도록 설정
                shouldCloseOnOverlayClick={false}
                style={{
                    overlay: { zIndex: 1000 },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '500px',
                        height: 'auto',
                        padding: '20px'
                    }
                }}
            >
                <h5 className="modal-title">현재 비밀번호 확인</h5>
                <input
                    type="password"
                    value={currentPw}
                    onChange={handleCurrentPwChange}
                    onKeyDown={handleKeyDown} // 엔터키 입력 이벤트 추가
                    placeholder="현재 비밀번호"
                    className={`form-control rounded-0 ${!isPwValid ? "is-invalid" : ""}`}
                />
                {/* 비밀번호가 유효하지 않을 때 에러 메시지 표시 */}
                {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
                <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                    <button type="button" className="btn btn-secondary rounded-0 me-2" onClick={() => {
                        navigate(`/member/mypage`); // 마이페이지로 이동
                    }}>
                        취소
                    </button>
                    <button type="button" className="btn btn-dark rounded-0" onClick={handlePasswordSubmit}>
                        확인
                    </button>
                </div>
            </Modal>

        </>
    );
};

export default MemberUpdate;
