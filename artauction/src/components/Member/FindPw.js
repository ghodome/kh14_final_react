import axios from "axios";
import { useCallback, useState } from "react";

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
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-12 col-md-5">
                    <div className="text-center mt-4">
                        <h2 style={{ fontWeight: 'bold', fontSize: '2.5rem' }}>
                            비밀번호 찾기
                        </h2>
                    </div>

                    <div className="mt-4">
                        <input
                            type="text"
                            className="form-control rounded-0"
                            placeholder="아이디 입력"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)} 
                        />
                    </div>

                    <div className="mt-4">
                        <input
                            type="email"
                            className="form-control rounded-0"
                            placeholder="이메일 입력"
                            value={memberEmail}
                            onChange={(e) => setMemberEmail(e.target.value)} 
                        />
                    </div>

                        {message && (
                            <div style={{ color: 'red', marginTop: '1rem' }}>
                                {message}
                            </div>
                        )}
                    <div className="mt-2">
                        <button 
                            className="btn btn-dark w-100 mt-2 rounded-0" 
                            onClick={handleFindPw}
                        >
                            비밀번호 재설정 이메일 전송
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FindPw;
