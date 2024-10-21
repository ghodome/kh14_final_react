import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const Faq = () => {
    // state
    const [faqList, setFaqList] = useState([]);
    const [selectedType, setSelectedType] = useState(null);

    // effect
    useEffect(() => {
        loadFaqList();
    }, []);

    // callback
    const loadFaqList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/faq/list");
        console.log(resp.data); // 응답 데이터 확인
        setFaqList(resp.data);

        // 첫 번째 버튼 자동 선택
        if (resp.data.length > 0) {
            setSelectedType(resp.data[0].faqType);
        }
    }, []);

    // 타입별 필터링
    const filteredFaqs = selectedType
        ? faqList.filter(faq => faq.faqType === selectedType)
        : faqList;

    // views
    return (
        <div className="container mt-4">
            <div className="text-center mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="검색"
                    style={{ width: '50%', margin: '0 auto' }}
                />
            </div>
            <div className="d-flex justify-content-center mb-4">
                {Array.from(new Set(faqList.map(faq => faq.faqType))).map(type => (
                    <button
                        key={type}
                        className={`btn mx-2 ${selectedType === type ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setSelectedType(type)}
                    >
                        {type}
                    </button>
                ))}
            </div>
            <div className="faq-content">
                {filteredFaqs.map(faq => (
                    <div key={faq.faqNo} className="border p-3 mb-2">
                        <h5 className="faq-title">{faq.faqType}</h5>
                        <p className="faq-text">{faq.faqContent}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faq;
