import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
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

    const [roomList, setRoomList] = useState([]);
    const modalRef = useRef(null);

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
            if (login) {
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
    }, [memberId, login]);

    const handleShowModal = async () => {
        try {
            const response = await axios.get("http://localhost:8080/room/");
            setRoomList(response.data);
            const modal = modalRef.current;
            modal.style.display = "block";
        } catch (error) {
            console.error("방 목록 로드 중 오류 발생:", error);
        }
    };

    const handleCloseModal = () => {
        const modal = modalRef.current;
        modal.style.display = "none";
    };

    const deleteRoom = async (roomNo) => {
        if (window.confirm("정말로 삭제하시겠습니까?")) {
            try {
                await axios.delete(`http://localhost:8080/room/${roomNo}`);
                const response = await axios.get("http://localhost:8080/room/");
                setRoomList(response.data);
            } catch (error) {
                console.error("방 삭제 중 오류 발생:", error);
            }
        }
    };

    const createInquiryRoom = useCallback(async () => {
        if (!memberId) return;

        try {
            const response = await axios.get("http://localhost:8080/room/");
            const existingRoom = response.data.find(room => room.roomName === memberId);

            if (existingRoom) {
                navigate(`/roomchat/${existingRoom.roomNo}`);
            } else {
                const newRoomResponse = await axios.post("http://localhost:8080/room/", { roomName: memberId });
                const newRoomNo = newRoomResponse.data.roomNo;
                navigate(`/roomchat/${newRoomNo}`);
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
                                            {memberId} ({blocked && memberRank !== '관리자' ? '차단된' : ''} {memberRank})
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
                                            <button className="nav-link btn" onClick={handleShowModal}>
                                                1:1 채팅방
                                            </button>
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
                            
                            {login &&(
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/charge">포인트 충전/환불</NavLink>
                            </li>
                            )}
                            {login &&(
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/payment">결제하기</NavLink>
                            </li>
                            )}
                            {login &&(
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/randomBox">랜덤박스</NavLink>
                            </li>

                            )}
                            {memberRank === '관리자' && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/giveup">관리자용 취소 물품 확인</NavLink>
                            </li>
                            )}
                            {memberRank === '회원' && (
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

            <div ref={modalRef} className="modal" style={{ display: "none", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1050 }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">채팅방 목록</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal} />
                        </div>
                        <div className="modal-body">
                            {roomList.length > 0 ? (
                                roomList.map(room => (
                                    <div key={room.roomNo} className="border p-2 mb-2 d-flex justify-content-between align-items-center">
                                        <strong>{room.roomName}</strong>
                                        <div>
                                            <button className="btn btn-success" onClick={() => {
                                                handleCloseModal();
                                                navigate(`/roomchat/${room.roomNo}`);
                                            }}>
                                                입장
                                            </button>
                                            <button className="btn btn-danger ms-2" onClick={() => deleteRoom(room.roomNo)}>
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>채팅방이 없습니다.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Menu;
