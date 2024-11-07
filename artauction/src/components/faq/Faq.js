import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import { Modal } from "bootstrap";
import { FaSearch, FaPlus, FaMinus } from 'react-icons/fa'; 
import { useRecoilValue } from "recoil";
import { loginState, memberRankState } from "../../utils/recoil";

const Faq = () => {
    //state
    const [faqList, setFaqList] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [selectedType, setSelectedType] = useState("회원");
    const [searchTerm, setSearchTerm] = useState("");
    const [isButtonClicked, setIsButtonClicked] = useState(null);
    const modalRef = useRef();
    const listModalRef = useRef();
    const [currentFaq, setCurrentFaq] = useState({ faqNo: null, faqType: "회원", faqTitle: "", faqContent: "" });
    const [openFaq, setOpenFaq] = useState(null); 

    // Recoil
    const memberRank = useRecoilValue(memberRankState);
    const login = useRecoilValue(loginState);

    //effect
    useEffect(() => {
        loadFaqList();
    }, []);

    //callback
    const loadFaqList = useCallback(async () => {
        const resp = await axios.get("/faq/list");
        setFaqList(resp.data);
        setFilteredFaqs(resp.data.filter(faq => faq.faqType === selectedType));
    }, [selectedType]);

    const handleTypeChange = (type) => {
        setSelectedType(type);
        const filtered = faqList.filter(faq => faq.faqType === type);
        setFilteredFaqs(filtered);
        setIsButtonClicked(type);
    };

    const handleSearch = () => {
        const filtered = searchTerm.trim() === ""
            ? faqList.filter(faq => faq.faqType === selectedType)
            : faqList.filter(faq =>
                faq.faqContent.toLowerCase().includes(searchTerm.toLowerCase()) 
            );
    
        const titles = filtered.map(faq => faq.faqTitle);
        const uniqueFiltered = faqList.filter(faq => titles.includes(faq.faqTitle));
    
        setFilteredFaqs(uniqueFiltered);
        if (searchTerm.trim() === "") {
            setSelectedType("회원");
        }
    };
    
    

    const openModal = (faq = null) => {
        setCurrentFaq(faq ? { ...faq } : { faqNo: null, faqType: "회원", faqTitle: "", faqContent: "" });
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
        const confirmSubmit = window.confirm(currentFaq.faqNo ? "정말로 수정하시겠습니까?" : "정말로 등록하시겠습니까?");
        if (confirmSubmit) {
            try {
                const formattedContent = currentFaq.faqContent.replace(/\n/g, "<br />");
                const faqToSubmit = { ...currentFaq, faqContent: formattedContent };
    
                if (currentFaq.faqNo) {
                    await axios.put(`/faq/`, faqToSubmit);
                } else {
                    await axios.post(`/faq/plus`, faqToSubmit);
                }
                closeModal();
                loadFaqList();
            } catch (error) {
                console.error("수정/등록 실패:", error);
            }
        }
    };


    const handleDelete = async (faqNo) => {
        const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
        if (confirmDelete) {
            try {
                await axios.delete(`/faq/${faqNo}`);
                loadFaqList();
            } catch (error) {
                console.error("삭제 실패:", error);
            }
        }
    };

    const handleEdit = (faq) => {
        openModal(faq);
        closeListModal();
    };

    const toggleFaq = (faqNo) => {
        setOpenFaq(openFaq === faqNo ? null : faqNo);
    };

    //views
    return (<>
        <div className="row">
            <div className="col" style={{ marginTop: '50px', marginBottom: '50px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '2rem' }}>FAQ (자주하는 질문)</span>
            </div>
        </div>
        <div className="container mt-4">
            <div className="text-center mb-4">
                <div className="input-group mb-3" style={{ width: '50%', margin: '0 auto' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="검색어를 입력하세요."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(); 
                            }
                        }}
                        style={{
                            border: 'none',
                            borderBottom: '1px solid black',
                            color: 'black',
                            borderRadius: '0',
                            boxShadow: 'none',
                            backgroundColor: 'white'
                        }}
                    />
                    <button
                        className="btn"
                        onClick={handleSearch}
                        style={{
                            backgroundColor: 'white',
                            borderBottom: '1px solid black',
                            borderRadius: '0',
                        }}
                    >
                        <FaSearch color="gray" />
                    </button>
                </div>
            </div>
            <div className="d-flex justify-content-center mb-4" style={{ flexWrap: 'nowrap' }}>
                {["회원", "경매", "결제", "기타", "배송"].map(type => (
                    <button
                        key={type}
                        onClick={() => handleTypeChange(type)}
                        style={{
                            backgroundColor: 'whitesmoke',
                            color: 'black',
                            border: '1px solid lightgray',
                            borderRadius: '0',
                            padding: '10px 20px',
                            margin: '5px',
                            flex: '1 1 0',
                            maxWidth: '20%',
                            cursor: 'pointer',
                            boxShadow: selectedType === type ? '0 0 0 1px lightgray' : 'none',
                            fontWeight: isButtonClicked === type ? 'bold' : 'normal'
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="d-flex justify-content-center mb-4">
                {memberRank === "관리자" && (
                    <>
                        <button className="btn btn-success me-2" onClick={() => openModal()}>
                            등록
                        </button>
                        <button className="btn btn-warning" onClick={openListModal}>
                            수정
                        </button>
                    </>
                )}
            </div>
            <div className="faq-content">
                {filteredFaqs.map(faq => (
                    <div key={faq.faqNo}>
                        <div
                            style={{
                                borderBottom: '1px solid lightgray',
                                padding: '15px 0',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            onClick={() => toggleFaq(faq.faqNo)}
                        >
                            <span className="faq-text" style={{ fontWeight: 'bold', fontSize: '20px' }}>Q. {faq.faqTitle}</span>
                            {openFaq === faq.faqNo ? <FaMinus color="gray" /> : <FaPlus color="gray" />}
                        </div>
                        {openFaq === faq.faqNo && (
                            <div style={{ padding: '10px 0', backgroundColor: 'whitesmoke', marginBottom: '10px' }}>
                                <b style={{ fontSize: '25px' }}>A.</b>
                                <span style={{ fontSize: '15px' }} dangerouslySetInnerHTML={{ __html: faq.faqContent }} />
                            </div>
                        )}
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
                                <label className="form-label">제목</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={currentFaq.faqTitle}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, faqTitle: e.target.value })}
                                />
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
                                            <strong>{faq.faqType}</strong>: {faq.faqTitle}
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-warning ms-2"
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
    </>
    );
};

export default Faq;
