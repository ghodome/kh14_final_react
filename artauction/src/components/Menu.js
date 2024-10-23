import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, memberIdState, memberRankState } from "../utils/recoil";
import Time from "./time/Time";


const Menu = () => {
    const navigate = useNavigate();
    const [memberId, setMemberId] = useRecoilState(memberIdState);
    const [memberRank, setMemberRank] = useRecoilState(memberRankState);

    const login = useRecoilValue(loginState);

    const logout = useCallback(() => {
        setMemberId("");
        setMemberRank("");
        delete axios.defaults.headers.common["Authorization"];
        window.localStorage.removeItem("refreshToken");
        window.sessionStorage.removeItem("refreshToken");
        navigate("/");
    }, [navigate, setMemberId, setMemberRank]);


    return (
        <>
            <nav className="navbar navbar-expand bg-light fixed-top" data-bs-theme="light">
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="top-menu">
                        <ul className="navbar-nav me-auto">
                            { }

                            {login ? (<>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/member/mypage">
                                        {memberId}
                                        ({memberRank})
                                    </NavLink>
                                </li>
                                {memberRank === '관리자' && (
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/member/search">
                                            회원조회
                                        </NavLink>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/"
                                        onClick={logout}>
                                        로그아웃
                                    </NavLink>
                                </li>
                            </>) : (<>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/join">
                                        회원가입
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login">
                                        로그인
                                    </NavLink>
                                </li>
                            </>)}

                            <li className="nav-item">
                                <NavLink className="nav-link" to="/artist">작가</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/auctionschedule">경매</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/work/list">작품</NavLink>
                            </li>
                        </ul>
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/notice">공지사항</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/faq">FAQ</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/websocket">websocket</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/charge">포인트 충전하기</NavLink>
                            </li>
                        </ul>

                    </div>
                </div>
            </nav>
        </>
    );
};

export default Menu;
