import axios from "axios";
import { useCallback, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, memberIdState, memberRankState } from "../utils/recoil";

const Menu = () => {
    const navigate = useNavigate();
    const [memberId, setMemberId] = useRecoilState(memberIdState);
    const [memberRank, setMemberRank] = useRecoilState(memberRankState);
    const login = useRecoilValue(loginState);
    const [roomNo, setRoomNo] = useState(null); // roomNo 상태 추가

    const logout = useCallback(() => {
        setMemberId("");
        setMemberRank("");
        delete axios.defaults.headers.common["Authorization"];
        window.localStorage.removeItem("refreshToken1");
        window.sessionStorage.removeItem("refreshToken1");
        navigate("/");
    }, [navigate, setMemberId, setMemberRank]);

    // 문의하기를 클릭했을 때 방으로 이동
    const goToInquiry = useCallback(async () => {
        if (login) {
            try {
                const response = await axios.get(`http://localhost:8080/room?memberId=${memberId}`);
                const roomData = response.data;

                if (roomData && roomData.roomNo) {
                    navigate(`/roomchat/${roomData.roomNo}`);
                } else {
                    console.error("No room number found for the member.");
                }
            } catch (error) {
                console.error("Failed to fetch room number:", error);
            }
        }
    }, [login, memberId, navigate]);

    return (
        <>
            <nav className="navbar navbar-expand bg-light fixed-top" data-bs-theme="light">
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="top-menu">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/">홈으로</NavLink>
                            </li>
                            {login ? (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/member/mypage">
                                            {memberId} ({memberRank})
                                        </NavLink>
                                    </li>
                                    {memberRank === '관리자' && (
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="admin/member/list">
                                                회원조회
                                            </NavLink>
                                        </li>
                                    )}
                                    {memberRank === '관리자' && (
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="/room">
                                                1:1 채팅방
                                            </NavLink>
                                        </li>
                                    )}
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/" onClick={logout}>
                                            로그아웃
                                        </NavLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/check">회원가입</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="nav-link" to="/login">로그인</NavLink>
                                    </li>
                                </>
                            )}
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
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/payment">결제하기</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/randomBox">랜덤박스</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/giveup">관리자용 취소 물품 확인</NavLink>
                            </li>
                            {login && (
                                <li className="nav-item">
                                   <button className="nav-link btn" onClick={goToInquiry}>문의하기</button>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Menu;
