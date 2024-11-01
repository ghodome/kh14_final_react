import axios from "axios";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Jumbotron from "../Jumbotron";
import { CgLogIn } from "react-icons/cg";
import FindPw from "./FindPw";
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
       try{
           const resp = await axios.post("http://localhost:8080/member/login", input);
   
           setMemberId(resp.data.memberId);
           setMemberRank(resp.data.memberRank);
   
           axios.defaults.headers.common["Authorization"]
               = "Bearer " + resp.data.accessToken;
   
           if (stay === true) {
               window.localStorage.setItem("refreshToken1", resp.data.refreshToken);
           }
           else {
               window.sessionStorage.setItem("refreshToken1", resp.data.refreshToken);
           }
           navigate("/");
       }
       catch(e){
        setErrorMessage("아이디 없거나 비밀번호 틀림");
       }

    }, [input, stay]);

   

    return (<>
        <div className="row">
            <div className="col-md-6 offset-md-3">

                <Jumbotron title="회원 로그인" />

                <div className="row mt-4">
                    <div className="col">
                        <input type="text" name="memberId" className="form-control"
                            placeholder="아이디 입력"
                            value={input.memberId} onChange={changeInput} 
                            onKeyUp={e=>e.key==='Enter'&&sendLoginRequest()}/>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col">
                        <input type={display ? "text" : "password"} name="memberPw" className="form-control"
                            placeholder="비밀번호 입력"
                            value={input.memberPw} onChange={changeInput}
                            onKeyUp={e=>e.key==='Enter'&&sendLoginRequest()} />
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col">

                        <label>
                            <input type="checkbox" className="form-check-input"
                                checked={display}
                                onChange={e => setDisplay(e.target.checked)} />
                            <span className="form-check-label ms-2">비밀번호 표시</span>
                        </label>

                        <label className="ms-5">
                            <input type="checkbox" className="form-check-input"
                                checked={stay}
                                onChange={e => setStay(e.target.checked)} />
                            <span className="form-check-label ms-2">로그인 유지</span>
                        </label>

                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col">
                        <button className="btn btn-success w-100"
                            onClick={sendLoginRequest}>
                            <CgLogIn />
                            <span className="ms-2">로그인</span>
                        </button>
                    </div>
                </div>
                {errorMessage && (
                        <div className="alert alert-danger mt-3">
                            {errorMessage}
                        </div>
                    )}

                <div className="row mt-4">
                    <div className="col">
                        <button className="btn btn-link" onClick={() => navigate("/findPw")}>
                            비밀번호 찾기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default MemberLogin;