import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { Modal } from "bootstrap";
import moment from "moment-timezone"; // moment-timezone을 사용하여 한국 시간 설정

const Notice = () => {
    const [noticeList, setNoticeList] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: "", type: "운영", content: "" });
    const modalRef = useRef();

    useEffect(() => {
        loadNoticeList();
    }, []);

    const loadNoticeList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/notice/list");
        setNoticeList(resp.data);
    }, []);

    const handleSearch = async () => {
        if (keyword.trim() === "") {
            loadNoticeList();
        } else {
            const respTitle = await axios.get(`http://localhost:8080/notice/column/notice_title/keyword/${keyword}`);
            const respType = await axios.get(`http://localhost:8080/notice/column/notice_type/keyword/${keyword}`);
            const combinedResults = [...respTitle.data, ...respType.data];

            const uniqueResults = Array.from(new Set(combinedResults.map(notice => notice.noticeNo)))
                .map(id => combinedResults.find(notice => notice.noticeNo === id));

            setNoticeList(uniqueResults);
        }
    };

    const handleAddNotice = async () => {
        try {
            await axios.post("http://localhost:8080/notice/plus", {
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

    // 작성일 포맷팅 함수
    const formatDate = (date) => {
        const messageDate = moment.tz(date, "Asia/Seoul");
        const today = moment.tz("Asia/Seoul").startOf('day');

        if (messageDate.isSame(today, 'd')) {
            return messageDate.format("a h:mm");
        } else {
            return messageDate.format("YYYY년 M월 D일");
        }
    };

    return (
        <>
            <div className="container mt-4">
                <div className="row align-items-center mb-3">
                    <div className="col text-center">
                        <h2>공지사항</h2>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-12 col-md-6 offset-md-3">
                        <div className="input-group">
                            <input 
                                type="text" 
                                value={keyword} 
                                className="form-control" 
                                onChange={e => setKeyword(e.target.value)} 
                                placeholder="검색" 
                                style={{ marginRight: '5px' }} 
                            />
                            <button 
                                className="btn btn-primary" 
                                onClick={handleSearch}>
                                검색
                            </button>
                            <button 
                                className="btn btn-success ms-2" 
                                onClick={openModal}>
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            
                <div className="container mt-4">
                    <table className="table table-bordered">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center">유형</th>
                                <th className="text-center">제목</th>
                                <th className="text-center">작성일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {noticeList.map(notice => (
                                <tr key={notice.noticeNo}>
                                    <td className="text-center">{notice.noticeType}</td>
                                    <td>
                                        <NavLink to={`/notice/detail/${notice.noticeNo}`}>{notice.noticeTitle}</NavLink>
                                    </td>
                                    <td className="text-center">{formatDate(notice.noticeWtime)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">내용</label>
                                <textarea 
                                    className="form-control" 
                                    rows="5" 
                                    value={newNotice.content} 
                                    onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })} 
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
