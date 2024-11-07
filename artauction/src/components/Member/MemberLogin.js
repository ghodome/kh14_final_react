import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Jumbotron from "../Jumbotron";
import { CgLogIn } from "react-icons/cg";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useRecoilState } from "recoil";
import { memberIdState, memberRankState } from "../../utils/recoil";

const MemberLogin = () => {
    const navigate = useNavigate();

    const [input, setInput] = useState({
        memberId: "", memberPw: ""
    });
    const [display, setDisplay] = useState(false);
    const [stay, setStay] = useState(false); // 로그인 유지 여부
    const [memberIdError, setMemberIdError] = useState("");
    const [memberPwError, setMemberPwError] = useState("");

    const [memberId, setMemberId] = useRecoilState(memberIdState);
    const [memberRank, setMemberRank] = useRecoilState(memberRankState);

    const changeInput = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
        setMemberIdError("");
        setMemberPwError("");
    }, [input]);

    const sendLoginRequest = useCallback(async () => {
        setMemberIdError("");
        setMemberPwError("");

        if (!input.memberId) {
            setMemberIdError("아이디를 입력하십시오.");
            return;
        }
        if (!input.memberPw) {
            setMemberPwError("비밀번호를 입력하십시오.");
            return;
        }

        try {
            const resp = await axios.post("/member/login", input);
            setMemberId(resp.data.memberId);
            setMemberRank(resp.data.memberRank);

            axios.defaults.headers.common["Authorization"] = "Bearer " + resp.data.accessToken;

            // 아이디 기억하기 기능 구현
            if (stay) {
                window.localStorage.setItem("savedMemberId", input.memberId);
            } else {
                window.localStorage.removeItem("savedMemberId");
            }

            window.sessionStorage.setItem("refreshToken1", resp.data.refreshToken);
            navigate("/");
        } catch (e) {
            if (e.response?.data?.code === 'INVALID_ID') {
                setMemberIdError("아이디가 잘못되었습니다.");
            } else if (e.response?.data?.code === 'INVALID_PASSWORD') {
                setMemberPwError("비밀번호가 잘못되었습니다.");
            } else {
                setMemberPwError("아이디와 비밀번호가 일치하지 않습니다.");
            }
        }
    }, [input, stay]);

    // 페이지 로드 시 아이디를 로컬 스토리지에서 불러오기
    useEffect(() => {
        const savedMemberId = window.localStorage.getItem("savedMemberId");
        if (savedMemberId) {
            setInput(prev => ({ ...prev, memberId: savedMemberId }));
            setStay(true); // 아이디 기억하기 체크
        }
    }, []);

    return (
        <div className="row justify-content-center">
            <div className="col-md-4">
                <div className="text-center">
                    <div className="row mt-4">
                        <div className="col">
                            <span style={{ fontWeight: 'bold', fontSize: '30px' }}>로그인</span>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <input type="text" name="memberId" className="form-control rounded-0"
                                placeholder="아이디 입력"
                                value={input.memberId} onChange={changeInput}
                                onKeyUp={e => e.key === 'Enter' && sendLoginRequest()} />
                            {memberIdError && (
                                <div className="d-flex justify-content-start" style={{ color: 'red', marginTop: '0.5rem' }}>
                                    {memberIdError}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col position-relative">
                            <input type={display ? "text" : "password"} name="memberPw" className="form-control rounded-0"
                                placeholder="비밀번호 입력"
                                value={input.memberPw} onChange={changeInput}
                                onKeyUp={e => e.key === 'Enter' && sendLoginRequest()} />
                            <span
                                className="position-absolute"
                                style={{
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem'
                                }} // 크기 조정
                                onMouseDown={() => setDisplay(true)}
                                onMouseUp={() => setDisplay(false)}
                                onMouseLeave={() => setDisplay(false)}
                            >
                                {display ? <RiEyeLine /> : <RiEyeOffLine />}
                            </span>
                            {memberPwError && (
                                <div className="d-flex justify-content-start" style={{ color: 'red', marginTop: '0.5rem' }}>
                                    {memberPwError}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="row mt-4">
                        <div className="col d-flex justify-content-start">
                            <label className="me-3">
                                <input type="checkbox" className="form-check-input rounded-0"
                                    checked={display}
                                    onChange={e => setDisplay(e.target.checked)} />
                                <span className="form-check-label ms-2">비밀번호 표시</span>
                            </label>
                            <label>
                                <input type="checkbox" className="form-check-input rounded-0"
                                    checked={stay}
                                    onChange={e => setStay(e.target.checked)} />
                                <span className="form-check-label ms-2">아이디 저장</span>
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

                    <div className="row mt-4 between">
                        <div className="col text-center">
                            <button className="btn btn-link" style={{ color: 'black', textDecoration: 'none' }} onClick={() => navigate("/findPw")}>
                                비밀번호 찾기
                            </button>
                        </div>
                        <div className="col text-center">
                            <button className="btn btn-link" style={{ color: 'black', textDecoration: 'none' }} onClick={() => navigate("/check")}>
                                회원가입
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MemberLogin;
