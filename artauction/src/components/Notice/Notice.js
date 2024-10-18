import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const Notice = () => {
    const [noticeList, setNoticeList] = useState([]);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        loadNoticeList();
    }, []);

    const loadNoticeList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/notice/list");
        setNoticeList(resp.data);
    }, []);

    const handleSearch = async () => {
        if (keyword.trim() === "") {
            loadNoticeList(); // 키워드가 없으면 전체 목록 불러오기
        } else {
            const resp = await axios.get(`http://localhost:8080/notice/column/notice_title/keyword/${keyword}`);
            setNoticeList(resp.data);
        }
    };

    return (
        <>
            <div className="container mt-4">
                <div className="row align-items-center">
                    <div className="col-9 text-center w-100">
                        <h2>공지사항</h2>
                    </div>
                    <div className="col-9">
                      </div>
                        <div className="d-flex justify-content-end col-3">
                            <input 
                                type="text" 
                                value={keyword} 
                                className="form-control me-2" 
                                onChange={e => setKeyword(e.target.value)} 
                                placeholder="검색" 
                            />
                            <button 
                                className="btn btn-primary" 
                                style={{ flexShrink: 0 }} 
                                onClick={handleSearch}>
                                검색
                            </button>
                        </div>
                    </div>
                </div>
            
            <div className="container mt-4">
                <table className="table table-bordered">
                    <thead className="table-white">
                    </thead>
                    <tbody className="table">
                        {noticeList.map(notice => (
                            <tr key={notice.noticeNo}>
                                <td className="text-center">{notice.noticeType}</td>
                                <td>
                                    <NavLink to={`/notice/detail/${notice.noticeNo}`}>{notice.noticeTitle}</NavLink>
                                </td>
                                <td className="text-center">{notice.noticeWtime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Notice;
