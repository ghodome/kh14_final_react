import { useNavigate } from "react-router-dom";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const MemberPwChange = () => {
    const navigate = useNavigate();

    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [member, setMember] = useState({
        memberId: "",
        memberName: "",
    });

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
            navigate("/login"); // 로그인 페이지로 리다이렉트
        }
    }, [navigate]);

    const isValidPassword = (password) => {
        const lengthPattern = /^.{8,16}$/; // 길이 8-16자
        const upperCasePattern = /[A-Z]/; // 대문자 포함
        const lowerCasePattern = /[a-z]/; // 소문자 포함
        const numberPattern = /[0-9]/; // 숫자 포함
        const specialCharPattern = /[!@#$]/; // 특수 문자 포함
        
        return (
            lengthPattern.test(password) &&
            upperCasePattern.test(password) &&
            lowerCasePattern.test(password) &&
            numberPattern.test(password) &&
            specialCharPattern.test(password)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // 비밀번호 유효성 검사
        if (!currentPw) {
            setError("현재 비밀번호를 입력하세요.");
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

        // 현재 비밀번호 확인 요청
        try {
            const resp = await axios.post("http://localhost:8080/member/verfiyPw", null, {
                params: {
                    memberId: member.memberId, // 실제 사용자 ID로 변경
                    memberPw: currentPw
                }
            });

            if (!resp.data) {
                setError("현재 비밀번호가 일치하지 않습니다.");
                return;
            }

            // 비밀번호 변경 요청
            await axios.patch("http://localhost:8080/member/update", {
                memberId: member.memberId, // 실제 사용자 ID로 변경
                memberPw: newPw
            });

            setSuccess("비밀번호가 성공적으로 변경되었습니다.");
            // 비밀번호 변경 후 마이페이지로 이동
            navigate("/member/mypage");
        } catch (error) {
            console.error("비밀번호 변경 오류:", error);
            setError("비밀번호 변경 중 오류가 발생했습니다.");
        }
    };

    return (
        <>
            <Jumbotron title={`${member.memberName} 님의 비밀번호 변경`} />
            <div className="row mt-4">
                <div className="col-md-6 offset-md-3">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="password"
                                value={currentPw}
                                onChange={handleCurrentPwChange}
                                placeholder="현재 비밀번호"
                                className="form-control rounded-0"
                            />
                        </div>
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
                            <button className="btn btn-dark rounded-0">수정 완료</button>
                            <button type="button" className="btn btn-secondary rounded-0" onClick={() => navigate(`/member/mypage`)}>
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default MemberPwChange;
