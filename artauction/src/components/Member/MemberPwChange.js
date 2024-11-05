import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { memberIdState, memberRankState } from "../../utils/recoil";
import { useRecoilState } from "recoil";
import Modal from "react-modal";

Modal.setAppElement('#root');

const MemberPwChange = () => {
    const navigate = useNavigate();

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(true); // 모달 상태 추가

    const [member, setMember] = useState({
        memberId: "",
        memberName: "",
    });
    const [memberId, setMemberId] = useRecoilState(memberIdState);
    const [memberRank, setMemberRank] = useRecoilState(memberRankState);

    const logout = useCallback(() => {
        setMemberId("");
        setMemberRank("");
        delete axios.defaults.headers.common["Authorization"];
        window.localStorage.removeItem("refreshToken1");
        window.sessionStorage.removeItem("refreshToken1");
        navigate("/");
    }, [navigate, setMemberId, setMemberRank]);

    useEffect(() => {
        loadMember();
    }, []);

    const handleCurrentPwChange = useCallback(e => {
        setCurrentPw(e.target.value);
    }, []);

    const handleNewPwChange = useCallback(e => {
        setNewPw(e.target.value);
    }, []);

    const handleConfirmPwChange = useCallback(e => {
        setConfirmPw(e.target.value);
    }, []);

    const loadMember = useCallback(async () => {
        try {
            const resp = await axios.get("http://localhost:8080/member/find");
            setMember(resp.data[0]);
        } catch (error) {
            console.error("Failed to load member data:", error);
            navigate("/login");
        }
    }, [navigate]);

    const isValidPassword = (password) => {
        const lengthPattern = /^.{8,16}$/;
        const upperCasePattern = /[A-Z]/;
        const lowerCasePattern = /[a-z]/;
        const numberPattern = /[0-9]/;
        const specialCharPattern = /[!@#$]/;

        return (
            lengthPattern.test(password) &&
            upperCasePattern.test(password) &&
            lowerCasePattern.test(password) &&
            numberPattern.test(password) &&
            specialCharPattern.test(password)
        );
    };

    const handlePasswordVerification = async () => {
        setError("");
        setSuccess("");

        if (!currentPw) {
            setError("현재 비밀번호를 입력하세요.");
            return;
        }

        try {
            const resp = await axios.post("http://localhost:8080/member/verfiyPw", null, {
                params: {
                    memberId: member.memberId,
                    memberPw: currentPw
                }
            });

            if (!resp.data) {
                setError("현재 비밀번호가 일치하지 않습니다.");
                return;
            }

            setModalIsOpen(false); // 인증 성공 시 모달 닫기

        } catch (error) {
            console.error("비밀번호 확인 오류:", error);
            setError("비밀번호 확인 중 오류가 발생했습니다.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // 현재 비밀번호와 새 비밀번호가 동일한지 확인
        if (currentPw === newPw) {
            setError("현재 비밀번호와 새 비밀번호는 같을 수 없습니다.");
            return;
        }

        if (!newPw) {
            setError("새 비밀번호를 입력하세요.");
            return;
        }
        if (!isValidPassword(newPw)) {
            setError("새 비밀번호는 8-16자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.");
            return;
        }
        if (newPw !== confirmPw) {
            setError("새 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await axios.patch("http://localhost:8080/member/update", {
                memberId: member.memberId,
                memberPw: newPw
            });

            setSuccess("비밀번호가 성공적으로 변경되었습니다.");

            setTimeout(() => {
                logout();
            }, 2000);

        } catch (error) {
            console.error("비밀번호 변경 오류:", error);
            setError("비밀번호 변경 중 오류가 발생했습니다.");
        }
    };

    // 엔터키를 눌렀을 때 비밀번호 인증을 실행하는 함수
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handlePasswordVerification();
        }
    };

    return (
        <>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <div className="row mt-4">
                        <div className="col mb-4">
                            <span style={{ fontWeight: 'bold', fontSize: '50px' }}>
                                {`${member.memberName} 님의 비밀번호 변경`}
                            </span>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: modalIsOpen ? 'none' : 'block' }}>
                        <div className="mb-3">
                            <input
                                type="password"
                                value={newPw}
                                onChange={handleNewPwChange}
                                placeholder="새 비밀번호"
                                className="form-control rounded-0"
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                value={confirmPw}
                                onChange={handleConfirmPwChange}
                                placeholder="새 비밀번호 확인"
                                className="form-control rounded-0"
                            />
                        </div>
                        {error && <div className="text-danger">{error}</div>}
                        {success && <div className="text-success">{success}</div>}
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
                        width: '500px',
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
                    onKeyDown={handleKeyDown} // 엔터키 이벤트 추가
                    placeholder="현재 비밀번호"
                    className="form-control rounded-0"
                />
                {error && <div className="text-danger mt-2">{error}</div>}
                <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                    <button type="button" className="btn btn-secondary rounded-0 me-2" onClick={() => navigate(`/member/mypage`)}>
                        취소
                    </button>
                    <button type="button" className="btn btn-dark rounded-0" onClick={handlePasswordVerification}>
                        확인
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default MemberPwChange;
