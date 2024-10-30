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
            <Jumbotron title= {`${member.memberName} 님의 비밀번호 변경`} />
            <div className="row mt-4">
                <div className="col-md-6 offset-md-3">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input
                                type="password"
                                value={currentPw}
                                onChange={handleCurrentPwChange}
                                placeholder="현재 비밀번호"
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                value={newPw}
                                onChange={handleNewPwChange}
                                placeholder="새 비밀번호"
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="password"
                                value={confirmPw}
                                onChange={handleConfirmPwChange}
                                placeholder="새 비밀번호 확인"
                                className="form-control"
                            />
                        </div>
                        {error && <div className="text-danger">{error}</div>}
                        {success && <div className="text-success">{success}</div>}
                        <button className="btn btn-success w-100">비밀번호 변경</button>
                        <button type="button" className="btn btn-secondary mt-2" onClick={() => navigate("/member/mypage")}>
                            취소
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default MemberPwChange;
