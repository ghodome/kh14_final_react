import axios from "axios";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Jumbotron from "../Jumbotron";
import { CgLogIn } from "react-icons/cg";
import { useRecoilState } from "recoil";
import { memberIdState, memberRankState } from "../../utils/recoil";

const MemberLogin = () => {
    const navigate = useNavigate();

    const [input, setInput] = useState({
        memberId: "", memberPw: ""
    });
    const [display, setDisplay] = useState(false);
    const [stay, setStay] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [memberId, setMemberId] = useRecoilState(memberIdState);
    const [memberRank, setMemberRank] = useRecoilState(memberRankState);

    const changeInput = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
        setErrorMessage("");
    }, [input]);

    const sendLoginRequest = useCallback(async () => {
        if (!input.memberId) {
            setErrorMessage("아이디를 입력하십시오.");
            return;
        }
        if (!input.memberPw) {
            setErrorMessage("비밀번호를 입력하십시오.");
            return;
        }

        try {
            const resp = await axios.post("http://localhost:8080/member/login", input);
            setMemberId(resp.data.memberId);
            setMemberRank(resp.data.memberRank);

            axios.defaults.headers.common["Authorization"]
                = "Bearer " + resp.data.accessToken;

            if (stay === true) {
                window.localStorage.setItem("refreshToken1", resp.data.refreshToken);
            } else {
                window.sessionStorage.setItem("refreshToken1", resp.data.refreshToken);
            }
            navigate("/");
        } catch (e) {
            setErrorMessage("아이디 또는 비밀번호가 잘못되었습니다.");
        }
    }, [input, stay]);

    return (
        <>

            <Jumbotron title="회원 로그인" />

            <div className="row mt-4">
                <div className="col">
                    <input type="text" name="memberId" className="form-control rounded-0"
                        placeholder="아이디 입력"
                        value={input.memberId} onChange={changeInput}
                        onKeyUp={e => e.key === 'Enter' && sendLoginRequest()} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <input type={display ? "text" : "password"} name="memberPw" className="form-control rounded-0"
                        placeholder="비밀번호 입력"
                        value={input.memberPw} onChange={changeInput}
                        onKeyUp={e => e.key === 'Enter' && sendLoginRequest()} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>
                        <input type="checkbox" className="form-check-input rounded-0"
                            checked={display}
                            onChange={e => setDisplay(e.target.checked)} />
                        <span className="form-check-label ms-2">비밀번호 표시</span>
                    </label>

                    <label className="ms-5">
                        <input type="checkbox" className="form-check-input rounded-0"
                            checked={stay}
                            onChange={e => setStay(e.target.checked)} />
                        <span className="form-check-label ms-2">로그인 유지</span>
                    </label>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <button className="btn btn-dark w-100 rounded-0"
                        onClick={sendLoginRequest}>
                        <CgLogIn />
                        <span className="ms-2">로그인</span>
                    </button>
                </div>
            </div>

            {errorMessage && (
                <div style={{ color: 'red', marginTop: '1rem' }}>
                    {errorMessage}
                </div>
            )}

            <div className="row mt-4">
                <div className="col text-center">
                    <button className="btn btn-link" style={{ textDecoration: 'none' }} onClick={() => navigate("/findPw")}>
                        비밀번호 찾기
                    </button>
                </div>
            </div>

        </>
    );
}

export default MemberLogin;
