import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { Modal } from "bootstrap";
import moment from "moment-timezone";
import { FaSearch, FaPlus } from 'react-icons/fa';
import { useRecoilValue } from "recoil";
import { loginState, memberRankState } from "../../utils/recoil";

const Notice = () => {
    //state
    const [noticeList, setNoticeList] = useState([]);
    const [allNotices, setAllNotices] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: "", type: "운영", content: "" });
    const modalRef = useRef();

    // 페이지네이션 상태 추가
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPageGroup, setCurrentPageGroup] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 15;
    const groupSize = 5;

    const memberRank = useRecoilValue(memberRankState);
    const login = useRecoilValue(loginState);

    //effect
    useEffect(() => {
        loadNoticeList();
    }, []);

    //callback
    const loadNoticeList = useCallback(async () => {
        try {
            const resp = await axios.get("/notice/list");
            // 날짜 기준으로 내림차순 정렬
            const sortedNotices = resp.data.sort((a, b) => new Date(b.noticeWtime) - new Date(a.noticeWtime));
            setAllNotices(sortedNotices);
            setTotalPages(Math.ceil(sortedNotices.length / pageSize));
            setNoticeList(sortedNotices.slice(0, pageSize));
        } catch (error) {
            console.error("공지사항 로드 실패:", error);
        }
    }, []);

    const handleSearch = async () => {
        if (keyword.trim() === "") {
            loadNoticeList();
        } else {
            try {
                const respTitle = await axios.get(`/notice/column/notice_title/keyword/${keyword}`);
                const respType = await axios.get(`/notice/column/notice_type/keyword/${keyword}`);
                const combinedResults = [...respTitle.data, ...respType.data];

                const uniqueResults = Array.from(new Set(combinedResults.map(notice => notice.noticeNo)))
                    .map(id => combinedResults.find(notice => notice.noticeNo === id));

                setAllNotices(uniqueResults);
                setTotalPages(Math.ceil(uniqueResults.length / pageSize));
                setCurrentPage(0);
                setNoticeList(uniqueResults.slice(0, pageSize));
            } catch (error) {
                console.error("검색 실패:", error);
            }
        }
    };

    const handleAddNotice = async () => {
        try {
            await axios.post("/notice/plus", {
                noticeType: newNotice.type,
                noticeTitle: newNotice.title,
                noticeContent: newNotice.content,
            });
            closeModal();
            loadNoticeList();
            setNewNotice({ title: "", type: "운영", content: "" });
        } catch (error) {
            console.error("공지 등록 실패:", error);
        }
    };

    const openModal = () => {
        setShowModal(true);
        const modal = Modal.getOrCreateInstance(modalRef.current);
        modal.show();
    };

    const closeModal = () => {
        const modal = Modal.getInstance(modalRef.current);
        modal.hide();
        setShowModal(false);
    };

    const formatDate = (date) => {
        const messageDate = moment.tz(date, "Asia/Seoul");
        return messageDate.format("YYYY.MM.DD");
    };

    const truncateTitle = (title) => {
        if (title.length > 40) {
            return title.substring(0, 40) + "...";
        }
        return title;
    };

    // 페이지네이션 버튼 클릭 핸들러
    const handlePageChange = (page) => {
        setCurrentPage(page);
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        setNoticeList(allNotices.slice(startIndex, endIndex));
    };

    // 페이지 그룹 변경 핸들러
    const handleGroupChange = (direction) => {
        const newGroup = currentPageGroup + direction;
        if (newGroup >= 0 && newGroup < Math.ceil(totalPages / groupSize)) {
            setCurrentPageGroup(newGroup);
            setCurrentPage(newGroup * groupSize);
            const startIndex = newGroup * groupSize * pageSize;
            const endIndex = startIndex + pageSize;
            setNoticeList(allNotices.slice(startIndex, endIndex));
        }
    };

    // 페이지를 첫 번째로 이동
    const handleFirstPage = () => {
        setCurrentPage(0);
        setCurrentPageGroup(0);
        setNoticeList(allNotices.slice(0, pageSize));
    };

    // 페이지를 마지막으로 이동
    const handleLastPage = () => {
        const lastPage = totalPages - 1;
        setCurrentPage(lastPage);
        setCurrentPageGroup(Math.floor(lastPage / groupSize));
        const startIndex = lastPage * pageSize;
        setNoticeList(allNotices.slice(startIndex));
    };

    // 페이지 버튼 렌더링 함수
    const renderPageButtons = () => {
        const startPage = currentPageGroup * groupSize;
        const endPage = Math.min(startPage + groupSize, totalPages);
        const pageButtons = [];

        for (let i = startPage; i < endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    className={`btn`}
                    style={{
                        backgroundColor: 'white',
                        color: i === currentPage ? 'black' : 'gray',
                        border: 'none',
                        fontWeight: i === currentPage ? 'bold' : 'normal',
                        margin: '0 5px',
                        padding: '10px 15px',
                    }}
                    onClick={() => handlePageChange(i)}
                >
                    {i + 1}
                </button>
            );
        }

        return pageButtons;
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };
    //views
    return (
        <>
            <div className="row mt-4">
                <div className="col mb-4">
                    <span style={{ fontWeight: 'bold', fontSize: '50px' }}>공지사항</span>
                </div>
            </div>
            <div className="container mt-4">
                <div className="row align-items-center mb-3">
                    <div className="col-3">
                        <span style={{ fontSize: '18px', fontWeight: '1000' }}>총&nbsp;
                             <b style={{color:'#00b894', fontWeight:'500'}}>{allNotices.length}</b>건</span>
                    </div>
                    <div className="col-6"></div>
                    <div className="col-3">
                        <div className="input-group">
                            <input
                                type="text"
                                value={keyword}
                                className="form-control"
                                onChange={e => setKeyword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={{ borderRight: 'none', boxShadow: 'none', backgroundColor: 'white' }}
                            />
                            <button
                                className="btn"
                                onClick={handleSearch}
                                style={{
                                    backgroundColor: 'white',
                                    color: 'black',
                                    border: '1px solid lightgray',
                                    borderLeft: 'none',
                                    borderRadius: '0'
                                }}
                            >
                                <FaSearch color="black" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col text-end">
                        {memberRank === "관리자" && (
                            <button
                                className="btn btn-success"
                                onClick={openModal}>
                                등록
                            </button>
                        )}
                    </div>
                </div>
                <hr />
                <div className="table-responsive mt-4">
                    <table className="table" style={{ backgroundColor: 'white', borderCollapse: 'collapse' }}>
                        <tbody>
                            {noticeList.map(notice => (
                                <tr key={notice.noticeNo}>
                                    <td style={{ width: '10%', textAlign: 'center', padding: '40px 0', borderBottom: '1px solid lightgray', fontSize: '15px' }}>
                                        {notice.noticeType}
                                    </td>
                                    <td style={{ width: '70%', textAlign: 'left', padding: '35px 0', borderBottom: '1px solid lightgray' }}>
                                        <NavLink to={`/notice/detail/${notice.noticeNo}`} style={{ textDecoration: 'none', color: 'black', fontSize: '20px', fontWeight: 'bold' }}>
                                            {truncateTitle(notice.noticeTitle)}
                                        </NavLink>
                                    </td>
                                    <td style={{ width: '20%', textAlign: 'center', padding: '35px 0', borderBottom: '1px solid lightgray', fontSize: '20px' }}>
                                        {formatDate(notice.noticeWtime)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 버튼 추가 */}
                <div className="d-flex justify-content-center mb-4">
                    <button className="btn" style={{ backgroundColor: 'white', color: 'black', margin: '0 5px' }} onClick={handleFirstPage}>
                        &lt;&lt;
                    </button>
                    <button className="btn" style={{ backgroundColor: 'white', color: 'black', margin: '0 5px' }} onClick={() => handleGroupChange(-1)}>
                        &lt;
                    </button>
                    {renderPageButtons()}
                    <button className="btn" style={{ backgroundColor: 'white', color: 'black', margin: '0 5px' }} onClick={() => handleGroupChange(1)}>
                        &gt;
                    </button>
                    <button className="btn" style={{ backgroundColor: 'white', color: 'black', margin: '0 5px' }} onClick={handleLastPage}>
                        &gt;&gt;
                    </button>
                </div>
            </div>

            {/* 모달 */}
            <div className="modal fade" tabIndex="-1" ref={modalRef}>
                <div className="modal-dialog" style={{ maxWidth: "40%" }} onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">공지사항 등록</h5>
                            <button type="button" className="btn-close" onClick={closeModal} />
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">유형</label>
                                <select
                                    className="form-select"
                                    value={newNotice.type}
                                    onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value })}>
                                    <option value="운영">운영</option>
                                    <option value="공지">공지</option>
                                    <option value="업데이트">업데이트</option>
                                    <option value="점검안내">점검안내</option>
                                    <option value="긴급공지">긴급공지</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">제목</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newNotice.title}
                                    onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">내용</label>
                                <textarea
                                    className="form-control"
                                    rows="5"
                                    value={newNotice.content}
                                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                            </div>
                            <button className="btn btn-primary" onClick={handleAddNotice}>
                                등록하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Notice;
