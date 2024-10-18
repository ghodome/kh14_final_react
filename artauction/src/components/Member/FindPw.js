import axios from "axios";
import { useCallback, useState } from "react";
import Jumbotron from "../Jumbotron";

const FindPw = () => {
    const [memberId, setMemberId] = useState("");
    const [memberEmail, setMemberEmail] = useState("");
    const [message, setMessage] = useState("");


    const handleFindPw = useCallback(async () => {
        try {
            const resp = await axios.post('http://localhost:8080/member/findPw', { memberId, memberEmail });
            setMessage(resp.data); // 서버에서 받은 메시지 표시
        } catch (error) {
            setMessage('이메일 전송에 실패했습니다. 아이디와 이메일 주소를 확인하세요.');
        }
    });

    return (<>
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
                <div className="row mt4">
                    <div className="col">
                        <button className="btn btn-primary w-100 mt-2" onClick={handleFindPw}>
                            비밀번호 재설정 이메일 전송
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>);
};

export default FindPw;