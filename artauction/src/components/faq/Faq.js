import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const Faq = () => {
    // state
    const [faqList, setFaqList] = useState([]);
    const [filteredFaqs, setFilteredFaqs] = useState([]);
    const [selectedType, setSelectedType] = useState("회원");
    const [searchTerm, setSearchTerm] = useState("");

    // effect
    useEffect(() => {
        loadFaqList();
    }, []);

    // callback
    const loadFaqList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/faq/list");
        setFaqList(resp.data);
        setFilteredFaqs(resp.data.filter(faq => faq.faqType === "회원"));
    }, []);

    // 타입 필터링
    const handleTypeChange = (type) => {
        setSelectedType(type);
        const filtered = faqList.filter(faq => faq.faqType === type);
        setFilteredFaqs(filtered);
    };

    // 검색 처리
    const handleSearch = () => {
        if (searchTerm.trim() === "") {
            if (selectedType) {
                const filtered = faqList.filter(faq => faq.faqType === selectedType);
                setFilteredFaqs(filtered);
            } else {
                setFilteredFaqs(faqList);
            }
        } else {
            const searchedFaqs = faqList.filter(faq =>
                faq.faqContent.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFaqs(searchedFaqs);
        }
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
                {Array.from(new Set(faqList.map(faq => faq.faqType))).map(type => (
                    <button
                        key={type}
                        className={`btn mx-2 ${selectedType === type ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleTypeChange(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <div className="faq-content">
                {filteredFaqs.map(faq => (
                    <div key={faq.faqNo} className="border p-3 mb-2">
                        <span className="faq-text">{faq.faqContent}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faq;
