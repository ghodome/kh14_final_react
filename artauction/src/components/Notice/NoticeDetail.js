import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "bootstrap";
import moment from "moment-timezone";
import { useRecoilValue } from "recoil";
import { loginState, memberRankState } from "../../utils/recoil";

const NoticeDetail = () => {
    //state
    const [showModal, setShowModal] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: "", type: "운영", content: "" });
    const modalRef = useRef();
    const { noticeNo } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);

    const memberRank = useRecoilValue(memberRankState);
    const login = useRecoilValue(loginState);

    //effect
    useEffect(() => {
        loadNotice();
    }, []);

    //callback
    const loadNotice = useCallback(async () => {
        const resp = await axios.get(`http://localhost:8080/notice/${noticeNo}`);
        setNotice(resp.data);
        setNewNotice({
            title: resp.data.noticeTitle,
            type: resp.data.noticeType,
            content: resp.data.noticeContent
        });
    }, [noticeNo]);

    const handleUpdateNotice = async () => {
        const confirmUpdate = window.confirm("정말로 수정하시겠습니까?");
        if (confirmUpdate) {
            try {
                await axios.put(`http://localhost:8080/notice/`, {
                    noticeNo: noticeNo,
                    noticeTitle: newNotice.title,
                    noticeType: newNotice.type,
                    noticeContent: newNotice.content,
                });
                closeModal();
                loadNotice();
            } catch (error) {
                console.error("수정 실패:", error);
            }
        }
    };

    const handleDeleteNotice = async () => {
        const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8080/notice/${noticeNo}`);
                navigate("/notice");
            } catch (error) {
                console.error("삭제 실패:", error);
            }
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

    //views
    return (
        notice !== null ? (
            <>
                <div className="row mt-4">
                    <div className="col mb-4">
                        <span style={{ fontWeight: 'bold', fontSize: '50px' }}>공지사항</span>
                    </div>
                </div>

                <div className="container mt-4" style={{ maxWidth: '80%' }}>
                    <div style={{ backgroundColor: 'whitesmoke', padding: '1cm 0', borderRadius: '5px' }} className="d-flex align-items-center mb-3">
                        <div style={{ flex: '0.8', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '20px', display: 'inline', marginLeft:'40px' }}>{notice.noticeTitle}</h3>
                        </div>
                        <div style={{ flex: '0.2', textAlign: 'center' }}>
                            <p style={{ margin: 0 }}>{moment(notice.noticeWtime).tz("Asia/Seoul").format("YYYY.MM.DD")}</p>
                        </div>
                    </div>

                    {/* 내용 */}
                    <div className="mb-4" style={{ marginLeft: '0.15rem', marginRight: '0.15rem', marginTop: '2cm', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '50%', height: '60vh', backgroundColor: 'whitesmoke', borderRadius: '5px', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                            <span style={{ margin: 0 }}>
                                {notice.noticeContent.split('\n').map((line, index) => (
                                    <span key={index}>{line}<br /></span>
                                ))}
                            </span>
                        </div>
                    </div>

                    {/* 버튼들 */}
                    <div className="d-flex justify-content-end">
                        <button type="button" className="btn btn-secondary me-2" onClick={() => navigate("/notice")}>목록</button>
                        {memberRank === "관리자" && (
                            <button type="button" className="btn btn-warning me-2" onClick={openModal}>수정</button>
                        )}
                        {memberRank === "관리자" && (
                            <button type="button" className="btn btn-danger" onClick={handleDeleteNotice}>삭제</button>
                        )}
                    </div>

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
                                    <button className="btn btn-primary" onClick={handleUpdateNotice}>
                                        수정하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <> </>
        )
    );
};

export default NoticeDetail;
