import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { blockedState, loginState, memberIdState, memberRankState } from "../utils/recoil";
import './Menu.css'; // Menu.css 파일 불러오기

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
            <nav className="navbar navbar-expand bg-white fixed-top" data-bs-theme="light">
                <div className="container-fluid" style={{ position: 'relative' }}>
                    <b
                        style={{
                            position: 'absolute',
                            top: '4vh',
                            left: '5%',
                            transform: 'translate(0%, -50%)',
                            fontSize: '1.8rem',
                            zIndex: 1051,
                            color: 'black',
                            fontFamily: "'Dancing Script', cursive",
                            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                            letterSpacing: '0.1em',
                            fontWeight: '300',
                            whiteSpace: 'nowrap',
                            maxWidth: 'calc(100% - 50px)',
                        }}
                    >
                        <NavLink className="nav-link" to="/">Art Auction</NavLink>
                    </b>

                    <ul className="navbar-nav ms-auto" style={{ position: 'absolute', right: '30px', top: '5px', fontSize:'12px'}}>
                        {login ? (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/member/mypage">
                                        {memberId} ({blocked && memberRank !== '관리자' ? '차단된' : ''} {memberRank})
                                    </NavLink>
                                </li>
                                <span style={{marginTop:'6px'}}>|</span>
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
                            <span style={{marginTop:'6px'}}>|</span>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login">로그인</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>

            {/* 중앙 네비게이션 바 메뉴 */}
            <nav className="navbar navbar-expand fixed-top" data-bs-theme="light" style={{ top: '2cm', marginLeft: '12.4cm' }}>
                <div className="container-fluid" style={{ position: 'relative' }}>
                    <div className="collapse navbar-collapse" id="top-menu" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <ul className="navbar-nav me-auto" style={{ textAlign: 'center' }}>

                            {/*-----------------------------*/}
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="true"
                                    aria-expanded={dropdownStates.auctions ? 'true' : 'false'}
                                    onClick={() => toggleDropdown('auctions')}
                                    style={{ fontWeight: 'bold', fontSize: '18px', }}
                                >
                                    Auctions
                                </a>
                                <div className={`dropdown-menu ${dropdownStates.auctions ? 'show' : ''}`}>
                                    <NavLink className="dropdown-item" to="/auctionschedule">경매</NavLink>
                                </div>
                            </li>

                            {/*-----------------------------*/}
                            <li className="nav-item dropdown" style={{ marginLeft: '1.5cm' }}>
                                <a
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="true"
                                    aria-expanded={dropdownStates.services ? 'true' : 'false'}
                                    onClick={() => toggleDropdown('services')}
                                    style={{ fontWeight: 'bold', fontSize: '18px' }}
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

                            {/*-----------------------------*/}
                            <li className="nav-item dropdown" style={{ marginLeft: '1.5cm' }}>
                                <a
                                    className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown"
                                    href="#"
                                    role="button"
                                    aria-haspopup="true"
                                    aria-expanded={dropdownStates.author ? 'true' : 'false'}
                                    onClick={() => toggleDropdown('author')}
                                    style={{ fontWeight: 'bold', fontSize: '18px' }}
                                >
                                    Author
                                </a>
                                <div className={`dropdown-menu ${dropdownStates.author ? 'show' : ''}`}>
                                    <NavLink className="dropdown-item" to="/artist">작가</NavLink>
                                </div>
                            </li>

                            {/*-----------------------------*/}
                            {memberRank === '회원' && (
                                <>
                                    <li className="nav-item dropdown" style={{ marginLeft: '1.5cm' }}>
                                        <a
                                            className="nav-link dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                            href="#"
                                            role="button"
                                            aria-haspopup="true"
                                            aria-expanded={dropdownStates.sell ? 'true' : 'false'}
                                            onClick={() => toggleDropdown('sell')}
                                            style={{ fontWeight: 'bold', fontSize: '18px' }}
                                        >
                                            Sell
                                        </a>
                                        <div className={`dropdown-menu ${dropdownStates.sell ? 'show' : ''}`}>
                                            <NavLink className="dropdown-item" to="/payment">결제</NavLink>
                                            <NavLink className="dropdown-item" to="/charge">충전/환불</NavLink>
                                        </div>
                                    </li>
                                </>
                            )}

                            {/*-----------------------------*/}
                            {memberRank === '관리자' && (
                                <>
                                    <li className="nav-item dropdown" style={{ marginLeft: '1.5cm' }}>
                                        <a
                                            className="nav-link dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                            href="#"
                                            role="button"
                                            aria-haspopup="true"
                                            aria-expanded={dropdownStates.manager ? 'true' : 'false'}
                                            onClick={() => toggleDropdown('manager')}
                                            style={{ fontWeight: 'bold', fontSize: '18px' }}
                                        >
                                            Manager
                                        </a>
                                        <div className={`dropdown-menu ${dropdownStates.manager ? 'show' : ''}`}>
                                            <NavLink className="dropdown-item" to="/admin/member/list">회원조회</NavLink>
                                            <NavLink className="dropdown-item" to="/giveup">취소 물품 확인</NavLink>
                                            <button className="nav-link btn" onClick={handleShowModal}>
                                                1:1 채팅방
                                            </button>
                                        </div>
                                    </li>
                                </>
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
