import axios from "axios";

import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { blockedState, loginState, memberIdState, memberRankState } from "../utils/recoil";

const Menu = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState({});
    const [memberId, setMemberId] = useRecoilState(memberIdState);
    const [memberRank, setMemberRank] = useRecoilState(memberRankState);
    const login = useRecoilValue(loginState);
    const [blocked, setBlocked] = useRecoilState(blockedState);
    const [roomNo, setRoomNo] = useState(null); // roomNo 상태 추가


    const logout = useCallback(() => {
        setMemberId("");
        setMemberRank("");
        delete axios.defaults.headers.common["Authorization"];
        window.localStorage.removeItem("refreshToken1");
        window.sessionStorage.removeItem("refreshToken1");
        navigate("/");
    }, [navigate, setMemberId, setMemberRank]);
    
    useEffect(() => {
        const loadMember = async () => {
            if (login) { // 로그인 상태일 때만 요청
                try {
                    const resp = await axios.get(`http://localhost:8080/member/${memberId}`);
                    setMember(resp.data);
                    setBlocked(resp.data.blocked);
                } catch (error) {
                    console.error("Failed to load member:", error);
                }
            }

        };
    
        loadMember();
    }, [memberId]);

    const createInquiryRoom = useCallback(async () => {
        if (!memberId) return; 
    
        try {
            const response = await axios.get("http://localhost:8080/room/"); 
            const existingRoom = response.data.find(room => room.roomName === memberId);
    
            if (existingRoom) {
                // 기존 방으로 이동
                navigate(`/roomchat/${existingRoom.roomNo}`);
            } else {
                // 방 생성
                const newRoomResponse = await axios.post("http://localhost:8080/room/", { roomName: memberId });
                const roomNo = newRoomResponse.data.roomNo; 
                navigate(`/roomchat/${roomNo}`); //RoomChat으로 이동
            }
        } catch (error) {
            console.error("방 생성 또는 이동 중 오류 발생:", error);
        }
    }, [memberId, navigate]);
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
                                            {memberId} ({blocked ? '차단된 ' : ''}{memberRank})
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
                                <NavLink className="nav-link" to="/charge">포인트 충전/환불</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/payment">결제하기</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/randomBox">랜덤박스</NavLink>
                            </li>

                            {memberRank === '관리자' && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/giveup">관리자용 취소 물품 확인</NavLink>
                            </li>
                            )}

                            {login && (
                                <li className="nav-item">
                                    <button className="nav-link btn" onClick={createInquiryRoom}>
                                        문의하기
                                    </button>
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
