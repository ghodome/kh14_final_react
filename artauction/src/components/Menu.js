import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { blockedState, loginState, memberIdState, memberRankState } from "../utils/recoil";
import './Menu.css'; // Menu.css 파일 불러오기
import Mypage from './Member/Mypage';

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

    // 드롭다운 메뉴 상태 관리
    const [dropdownStates, setDropdownStates] = useState({
        auctions: false,
        services: false,
        author: false,
        sell: false,
        manager: false,
    });

    // 드롭다운 토글 함수
    const toggleDropdown = (menu) => {
        setDropdownStates(prevState => ({
            ...prevState,
            [menu]: !prevState[menu]
        }));
    };

    return (
        <>
            <nav className="navbar navbar-expand fixed-top" data-bs-theme="light" style={{ backgroundColor: 'white' }}>
                <div className="container-fluid" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {/* 왼쪽 상단: Art Auction 로고 */}
                    <b
                        style={{
                            fontSize: '1.8rem',
                            zIndex: 1051,
                            color: 'black',
                            fontFamily: "'Dancing Script', cursive",
                            letterSpacing: '0.1em',
                            fontWeight: '300',
                            whiteSpace: 'nowrap',
                            backgroundColor: 'white',
                            padding: '5px',
                            borderRadius: '5px',
                            marginLeft: '1cm'
                        }}
                    >
                        <NavLink className="nav-link" to="/">Art Auction</NavLink>
                    </b>

                    {/* 중앙 네비게이션 메뉴 */}
                    <div
                        className="collapse navbar-collapse"
                        id="top-menu"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            marginTop: '2cm'  // 중앙 네비게이션 메뉴를 2cm 아래로 내림
                        }}
                    >
                        <ul className="navbar-nav" style={{ display: 'flex', gap: '20px', fontSize: '18px', listStyle: 'none' }}>
                            {/* Auctions 메뉴 */}
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="true"
                                    aria-expanded={dropdownStates.auctions ? 'true' : 'false'}
                                    onClick={() => toggleDropdown('auctions')}
                                    style={{ fontWeight: 'bold' }}
                                >
                                    Auctions
                                </a>
                                <div className={`dropdown-menu ${dropdownStates.auctions ? 'show' : ''}`}>
                                    <NavLink className="dropdown-item" to="/auctionschedule">경매</NavLink>
                                </div>
                            </li>

                            {/* Services 메뉴 */}
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="true"
                                    aria-expanded={dropdownStates.services ? 'true' : 'false'}
                                    onClick={() => toggleDropdown('services')}
                                    style={{ fontWeight: 'bold' }}
                                >
                                    Services
                                </a>
                                <div className={`dropdown-menu ${dropdownStates.services ? 'show' : ''}`}>
                                    <NavLink className="dropdown-item" to="/notice">공지사항</NavLink>
                                    <NavLink className="dropdown-item" to="/faq">FAQ</NavLink>
                                    <NavLink className="dropdown-item" to="/work/list">작품</NavLink>
                                    {memberRank === '회원' && (
                                        <>
                                            <li className="nav-item">
                                                <button className="nav-link btn" onClick={createInquiryRoom}>
                                                    문의하기
                                                </button>
                                            </li>
                                            <NavLink className="dropdown-item" to="/randomBox">랜덤박스</NavLink>
                                        </>
                                    )}
                                </div>
                            </li>

                            {/* Author 메뉴 */}
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="true"
                                    aria-expanded={dropdownStates.author ? 'true' : 'false'}
                                    onClick={() => toggleDropdown('author')}
                                    style={{ fontWeight: 'bold' }}
                                >
                                    Author
                                </a>
                                <div className={`dropdown-menu ${dropdownStates.author ? 'show' : ''}`}>
                                    <NavLink className="dropdown-item" to="/artist">작가</NavLink>
                                </div>
                            </li>

                            {/* Sell 메뉴 (회원만 표시) */}
                            {memberRank === '회원' && (
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                        href="#"
                                        role="button"
                                        aria-haspopup="true"
                                        aria-expanded={dropdownStates.sell ? 'true' : 'false'}
                                        onClick={() => toggleDropdown('sell')}
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        Sell
                                    </a>
                                    <div className={`dropdown-menu ${dropdownStates.sell ? 'show' : ''}`}>
                                        <NavLink className="dropdown-item" to="/payment">결제</NavLink>
                                        <NavLink className="dropdown-item" to="/charge">충전/환불</NavLink>
                                    </div>
                                </li>
                            )}

                            {/* Manager 메뉴 (관리자만 표시) */}
                            {memberRank === '관리자' && (
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                        href="#"
                                        role="button"
                                        aria-haspopup="true"
                                        aria-expanded={dropdownStates.manager ? 'true' : 'false'}
                                        onClick={() => toggleDropdown('manager')}
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        Manager
                                    </a>
                                    <div className={`dropdown-menu ${dropdownStates.manager ? 'show' : ''}`}>
                                        <NavLink className="dropdown-item" to="/admin/member/list">회원조회</NavLink>
                                        <NavLink className="dropdown-item" to="/giveup">취소 물품 확인</NavLink>
                                        <NavLink className="nav-link" to="/paymentcancel">취소시키기</NavLink>
                                        <button className="nav-link btn" onClick={handleShowModal}>
                                            1:1 채팅방
                                        </button>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>


                    {/* 오른쪽 상단: 로그인/회원가입 및 마이페이지/로그아웃 */}
                    <ul
                        className="navbar-nav"
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '12px',
                            marginRight: '100px',
                            flexDirection: 'row',  // 가로로 나열되도록 설정
                            alignItems: 'center',  // 세로 중앙 정렬
                        }}
                    >
                        {login ? (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/member/mypage">
                                    Mypage{/* Mypage ({blocked && memberRank !== '관리자' ? '차단된' : ''} {memberRank}) */}
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <span style={{ margin: '0 5px' }}>|</span>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/" onClick={logout}>
                                        LogOut
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/check" style={{ whiteSpace: 'nowrap' }}>Join</NavLink>
                                </li>
                                <li className="nav-item">
                                    <span style={{ margin: '0 5px' }}>|</span>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login" style={{ whiteSpace: 'nowrap' }}>LogIn</NavLink>
                                </li>
                            </>
                        )}
                    </ul>


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
