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

    const handleChangePw = useCallback(async () => {
        if (newPw !== confirmPw) {
            setMessage('비밀번호가 일치하지 않습니다.');
            return;
        }
    
        try {
            const resp = await axios.post(`http://localhost:8080/member/changePw?token=${token}`, { newPw });
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
                    <Jumbotron title="비밀번호 재설정" />
                    {message && <div className="alert alert-danger">{message}</div>} {/* 메시지 표시 */}
                    <div className="row mt-4">
                        <div className="col">
                            <input type="password"
                                className="form-control"
                                placeholder="새 비밀번호"
                                value={newPw}
                                onChange={(e) => setNewPw(e.target.value)} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type="password"
                                className="form-control"
                                placeholder="비밀번호 확인"
                                value={confirmPw}
                                onChange={(e) => setConfirmPw(e.target.value)} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <button className="btn btn-primary w-100 mt-2" onClick={handleChangePw}>
                                비밀번호 재설정
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChangePw;
