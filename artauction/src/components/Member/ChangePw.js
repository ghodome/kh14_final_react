import axios from "axios";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Jumbotron from "../Jumbotron";

const ChangePw = () => {
    const { token } = useParams(); // 토큰 추출
    console.log("Received token:", token);

    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

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

    const handleChangePw = useCallback(async () => {
        setMessage(""); // 에러 메시지 초기화

        // 비밀번호 유효성 검사
        if (!newPw) {
            setMessage('새 비밀번호를 입력하세요.');
            return;
        }
        if (!confirmPw) {
            setMessage('비밀번호 확인을 입력하세요.');
            return;
        }
        if (!isValidPassword(newPw)) {
            setMessage('새 비밀번호는 8-16자, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
            return;
        }
        if (newPw !== confirmPw) {
            setMessage('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const resp = await axios.post(`http://localhost:8080/member/changePw?token=${token}`, {
                newPw: newPw
            });
            // 성공적으로 비밀번호가 변경된 후 리다이렉트
            if (resp.status === 200) {
                navigate('/login'); // 로그인 페이지로 리다이렉트
            }
        } catch (error) {
            // 에러 처리
            console.error(error);
            setMessage('비밀번호 변경에 실패했습니다.');
        }
    }, [newPw, confirmPw, token, navigate]);

    return (
        <>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                <div className="row mt-4">
                        <div className="col mb-4">
                            <span style={{ fontWeight: 'bold', fontSize: '50px' }}>
                              비밀번호 재설정
                            </span>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input
                                type="password"
                                className="form-control rounded-0"
                                placeholder="새 비밀번호"
                                value={newPw}
                                onChange={(e) => setNewPw(e.target.value)} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input
                                type="password"
                                className="form-control rounded-0"
                                placeholder="비밀번호 확인"
                                value={confirmPw}
                                onChange={(e) => setConfirmPw(e.target.value)} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <button className="btn btn-dark w-100 mt-2 rounded-0" onClick={handleChangePw}>
                                비밀번호 재설정
                            </button>
                        </div>
                    </div>

                    {message && (
                        <div style={{ color: 'red', marginTop: '1rem' }}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ChangePw;
