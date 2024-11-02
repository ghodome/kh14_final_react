import axios from "axios";
import { useCallback, useState } from "react";
import Jumbotron from "../Jumbotron";

const FindPw = () => {
    const [memberId, setMemberId] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleFindPw = useCallback(async () => {
        if (!memberId) {
            setMessage("아이디를 입력하여 주십시오.");
            return;
        }
        if (!memberEmail) {
            setMessage("이메일을 입력하여 주십시오.");
            return;
        }

        try {
            const resp = await axios.post('http://localhost:8080/member/findPw', { memberId, memberEmail });
            setMessage('비밀번호 재설정 이메일이 전송되었습니다.'); // 이메일 전송 성공
        } catch (error) {
            setMessage('아이디와 이메일이 일치하지 않습니다.'); // 오류 처리
        }
    }, [memberId, memberEmail]);

    return (
        <>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <Jumbotron title="비밀번호 찾기"
                        content="비밀번호를 찾고자 하는 아이디와 이메일을 적으십시오" />
                    <div className="row mt-4">
                        <div className="col">
                            <input type="text"
                                className="form-control"
                                placeholder="아이디 입력"
                                value={memberId}
                                onChange={(e) => setMemberId(e.target.value)} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type="email"
                                className="form-control"
                                placeholder="이메일 입력"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <button className="btn btn-primary w-100 mt-2" onClick={handleFindPw}>
                                비밀번호 재설정 이메일 전송
                            </button>
                        </div>
                    </div>
                    {message && (
                        <div className="row mt-4">
                            <div className="col">
                                <div className="alert alert-info">{message}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FindPw;
