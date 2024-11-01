import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import { Modal } from "bootstrap";

const Faq = () => {
    const [faqList, setFaqList] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [selectedType, setSelectedType] = useState("회원");
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showListModal, setShowListModal] = useState(false);
    const [currentFaq, setCurrentFaq] = useState({ faqNo: null, faqType: "회원", faqContent: "" });
    const modalRef = useRef();
    const listModalRef = useRef();

    useEffect(() => {
        loadFaqList();
    }, []);

    const loadFaqList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/faq/list");
        setFaqList(resp.data);
        setFilteredFaqs(resp.data.filter(faq => faq.faqType === selectedType));
    }, [selectedType]);

    const handleTypeChange = (type) => {
        setSelectedType(type);
        const filtered = faqList.filter(faq => faq.faqType === type);
        setFilteredFaqs(filtered);
    };

    const handleSearch = () => {
        const filtered = searchTerm.trim() === ""
            ? faqList.filter(faq => faq.faqType === selectedType)
            : faqList.filter(faq =>
                faq.faqContent.toLowerCase().includes(searchTerm.toLowerCase())
            );
        setFilteredFaqs(filtered);
        // 검색 후 회원 버튼이 선택되도록 업데이트
        if (searchTerm.trim() === "") {
            setSelectedType("회원");
        }
    };

    const openModal = (faq = null) => {
        setCurrentFaq(faq ? { ...faq } : { faqNo: null, faqType: "회원", faqContent: "" });
        const modal = Modal.getOrCreateInstance(modalRef.current);
        modal.show();
    };

    const closeModal = () => {
        const modal = Modal.getInstance(modalRef.current);
        modal.hide();
    };

    const openListModal = () => {
        const modal = Modal.getOrCreateInstance(listModalRef.current);
        modal.show();
    };

    const closeListModal = () => {
        const modal = Modal.getInstance(listModalRef.current);
        modal.hide();
    };

    const handleSubmit = async () => {
        try {
            if (currentFaq.faqNo) {
                // 수정
                await axios.put(`http://localhost:8080/faq/`, currentFaq);
            } else {
                // 등록
                await axios.post(`http://localhost:8080/faq/plus`, currentFaq);
            }
            closeModal();
            loadFaqList(); // 목록 갱신
        } catch (error) {
            console.error("수정/등록 실패:", error);
        }
    };

    const handleDelete = async (faqNo) => {
        try {
            await axios.delete(`http://localhost:8080/faq/${faqNo}`);
            loadFaqList(); // 목록 갱신
        } catch (error) {
            console.error("삭제 실패:", error);
        }
    };

    const handleEdit = (faq) => {
        openModal(faq); // 수정 모달 열기
        closeListModal(); // 목록 모달 닫기
    };

    return (
        <div className="container mt-4">
            <div className="text-center mb-4">
                <div className="input-group mb-3" style={{ width: '50%', margin: '0 auto' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="검색"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={handleSearch}>
                        검색
                    </button>
                </div>
            </div>
            <div className="d-flex justify-content-center mb-4">
                {["회원", "경매", "결제", "기타", "배송"].map(type => (
                    <button
                        key={type}
                        className={`btn mx-2 ${selectedType === type ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleTypeChange(type)}
                    >
                        {type}
                    </button>
                ))}
                <div>
                    <button className="btn btn-primary me-2" onClick={() => openModal()}>
                        등록
                    </button>
                    <button className="btn btn-secondary" onClick={openListModal}>
                        수정
                    </button>
                </div>
            </div>
            <div className="faq-content">
                {filteredFaqs.map(faq => (
                    <div key={faq.faqNo} className="border p-3 mb-2 d-flex justify-content-between align-items-center">
                        <span className="faq-text">{faq.faqContent}</span>
                    </div>
                ))}
            </div>

            {/* FAQ 등록/수정 모달 */}
            <div className="modal fade" tabIndex="-1" ref={modalRef}>
                <div className="modal-dialog" style={{ maxWidth: "40%" }} onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{currentFaq.faqNo ? 'FAQ 수정' : 'FAQ 등록'}</h5>
                            <button type="button" className="btn-close" onClick={closeModal} />
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">유형</label>
                                <select 
                                    className="form-select" 
                                    value={currentFaq.faqType} 
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, faqType: e.target.value })}>
                                    <option value="회원">회원</option>
                                    <option value="경매">경매</option>
                                    <option value="결제">결제</option>
                                    <option value="기타">기타</option>
                                    <option value="배송">배송</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">내용</label>
                                <textarea 
                                    className="form-control" 
                                    rows="5" 
                                    value={currentFaq.faqContent} 
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, faqContent: e.target.value })} 
                                />
                            </div>
                            <button className="btn btn-primary" onClick={handleSubmit}>
                                {currentFaq.faqNo ? '수정하기' : '등록하기'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 전체 FAQ 목록 모달 */}
            <div className="modal fade" tabIndex="-1" ref={listModalRef}>
                <div className="modal-dialog" style={{ maxWidth: "60%" }} onClick={(e) => e.stopPropagation()}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">전체 FAQ 목록</h5>
                            <button type="button" className="btn-close" onClick={closeListModal} />
                        </div>
                        <div className="modal-body">
                            <div className="faq-list">
                                {faqList.map(faq => (
                                    <div key={faq.faqNo} className="border p-2 mb-2 d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{faq.faqType}</strong>: {faq.faqContent}
                                        </div>
                                        <div>
                                            <button 
                                                className="btn btn-secondary ms-2" 
                                                onClick={() => handleEdit(faq)} // 수정
                                            >
                                                수정
                                            </button>
                                            <button 
                                                className="btn btn-danger ms-2" 
                                                onClick={() => handleDelete(faq.faqNo)} // 삭제
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Faq;
