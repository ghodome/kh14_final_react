import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "bootstrap"; // Bootstrap 모달을 사용하기 위해 추가

const NoticeDetail = () => {
    // 모달 관련 state
    const [showModal, setShowModal] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: "", type: "운영", content: "" });
    const modalRef = useRef();

    // 파라미터
    const { noticeNo } = useParams();
    // navigator
    const navigate = useNavigate();
    // state
    const [notice, setNotice] = useState(null);

    // effect
    useEffect(() => {
        loadNotice();
    }, []);

    // callback
    const loadNotice = useCallback(async () => {
        const resp = await axios.get(`http://localhost:8080/notice/${noticeNo}`);
        setNotice(resp.data);
        setNewNotice({
            title: resp.data.noticeTitle,
            type: resp.data.noticeType,
            content: resp.data.noticeContent
        }); // 기존 정보로 초기화
    }, [noticeNo]);

    const handleUpdateNotice = async () => {
        try {
            await axios.put(`http://localhost:8080/notice/`, {
                noticeNo: noticeNo,
                noticeTitle: newNotice.title,
                noticeType: newNotice.type,
                noticeContent: newNotice.content,
            });
            closeModal(); // 모달 닫기
            loadNotice(); // 수정 후 현재 공지사항 새로고침
        } catch (error) {
            console.error("수정 실패:", error);
        }
    };

    const handleDeleteNotice = async () => {
        try {
            await axios.delete(`http://localhost:8080/notice/${noticeNo}`);
            navigate("/notice"); // 목록으로 이동
        } catch (error) {
            console.error("삭제 실패:", error);
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

    return (
        notice !== null ? (
            <>
                <h1>{notice.noticeTitle}</h1>
                <p>{notice.noticeContent}</p>
                <p>게시일: {new Date(notice.noticeWtime).toLocaleString()}</p>

                <button type="button" className="btn btn-secondary" onClick={e => navigate("/notice")}>목록</button>
                <button type="button" className="btn btn-secondary" onClick={openModal}>수정</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteNotice}>삭제</button>

                {/* 수정 모달 */}
                <div className="modal fade" tabIndex="-1" ref={modalRef}>
                    <div className="modal-dialog" style={{ maxWidth: "40%" }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">공지사항 수정</h5>
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
                                <button className="btn btn-primary" onClick={handleUpdateNotice}>
                                    수정하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <> </>))}


export default NoticeDetail;
