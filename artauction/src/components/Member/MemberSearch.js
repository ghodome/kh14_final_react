import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { PiTildeBold } from "react-icons/pi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import './MemberSearch.css';

Modal.setAppElement('#root');

const MemberSearch = () => {
    const navigate = useNavigate();
    const [basicSearch, setBasicSearch] = useState({
        keyword: "",
        column: "member_id"
    });

    const [searchColumn, setSearchColumn] = useState("member_id");
    const [input, setInput] = useState({
        memberId: "",
        memberName: "",
        memberContact: "",
        memberEmail: "",
        memberRankList: [],
        minMemberPoint: "",
        maxMemberPoint: "",
        memberAddress: "",
        beginMemberJoinDate: "",
        endMemberJoinDate: "",
        orderList: [],
        isBlocked: false,
    });

    const [result, setResult] = useState({
        count: 0,
        last: true,
        memberList: []
    });
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [activeCondition, setActiveCondition] = useState(null); // 상태추가: 어떤 조건이 활성화되어 있는지 추적
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // 상태추가: 상세조건 버튼 토글

    const handleBasicSearchChange = (e) => {
        setBasicSearch({
            ...basicSearch,
            keyword: e.target.value
        });
    };
    

    const handleBasicSearch = async () => {
        setInput({
            memberId: "",
            memberName: "",
            memberContact: "",
            memberEmail: "",
            memberRankList: [],
            minMemberPoint: "",
            maxMemberPoint: "",
            memberAddress: "",
            beginMemberJoinDate: "",
            endMemberJoinDate: "",
            orderList: [],
            isBlocked: false,
        });
        setSearchColumn("member_id");
        setPage(1);
        const resp = await axios.post("http://localhost:8080/member/search", {
            basicKeyword: basicSearch.keyword,
            searchColumn: searchColumn,
            isBlocked: input.isBlocked,
            ...input,
            beginRow: (page - 1) * size,
            endRow: (page === 1 ? page * size : (page * size) - 1),
        });
    
        const allMembers = resp.data.memberList;
        const filteredMemberList = allMembers.filter(member => member.memberRank !== '관리자');
    
        setResult({
            last: resp.data.last,
            memberList: filteredMemberList,
            count: resp.data.count,
        });
    };

    const handleSearchColumnChange = (e) => {
        setSearchColumn(e.target.value);
    };
    const toggleCondition = (condition) => {
        if (activeCondition === condition) {
            setActiveCondition(null); // 이미 열려 있으면 닫기
        } else {
            setActiveCondition(condition); // 새로 열기
        }
    };


    useEffect(() => {
        const fetchInitialData = async () => {
            const resp = await axios.post("http://localhost:8080/member/search", {
                basicKeyword: basicSearch.keyword,
                searchColumn: searchColumn,
                isBlocked: input.isBlocked,
                ...input,
                beginRow: (page - 1) * size,
                endRow: (page === 1 ? page * size : (page * size) - 1),
            });
    
            const allMembers = resp.data.memberList;
            const filteredMemberList = allMembers.filter(member => member.memberRank !== '관리자');
    
            setResult({
                last: resp.data.last,
                memberList: filteredMemberList,
                count: resp.data.count,
            });
        };
    
        fetchInitialData();
    }, [page, size]);  // 처음 로드될 때와 페이지 번호, 페이지 크기 변경 시 호출
    

    const sendRequest = useCallback(async () => {
        const resp = await axios.post("http://localhost:8080/member/search", {
            basicKeyword: basicSearch.keyword,
            searchColumn: searchColumn,
            isBlocked: input.isBlocked,
            ...input,
            beginRow: (page - 1) * size,
            endRow: (page === 1 ? page * size : (page * size) - 1),
        });

        const allMembers = resp.data.memberList;
        const filteredMemberList = allMembers.filter(member => member.memberRank !== '관리자');

        setResult({
            last: resp.data.last,
            memberList: filteredMemberList,
            count: resp.data.count,
        });
    }, [basicSearch, input, page, searchColumn, size]);

    const changeInputString = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    const changeInputNumber = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: parseInt(e.target.value) || ""
        });
    }, [input]);

    const changeOrder = (order) => {
        setInput(prevInput => {
            const newOrderList = prevInput.orderList.includes(order)
                ? prevInput.orderList.filter(o => o !== order)
                : [...prevInput.orderList, order];

            return { ...prevInput, orderList: newOrderList };
        });
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);

    };

    const handleMemberClick = (memberId) => {
        navigate(`/admin/member/detail/${memberId}`);
    };

    const totalPages = Math.ceil(result.count / size);
    const startPage = Math.max(1, page - 4);
    const endPage = Math.min(totalPages, page + 4);

    return (
        <div className="row">
            <div className="col-md-6 offset-md-3">
                <div className="col-sm-12 d-flex mt-3">
                    <select className="form-select form-select-sm rounded-0" style={{ width: '30%' }}
                        onChange={handleSearchColumnChange} value={searchColumn}>
                        <option value="member_id">아이디</option>
                        <option value="member_name">이름</option>
                        <option value="member_email">이메일</option>
                    </select>
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control rounded-0"
                            value={basicSearch.keyword}
                            onChange={handleBasicSearchChange}
                            style={{ width: '70%', backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }}
                        />
                        <button className="btn btn-dark rounded-0" onClick={handleBasicSearch}>
                            <FaMagnifyingGlass />
                        </button>
                    </div>
                </div>

                <div className="col-sm-12 d-flex">
                    <button className="btn btn-secondary w-100 rounded-0" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                        상세 조건
                    </button>
                </div>

                {showAdvancedFilters && (
                    <div className="col-sm-12 advanced-filters-container"> {/* 상세 조건 영역 */}
                        <div className="advanced-filters-buttons text-center"> {/* 상세 조건 버튼들 */}
                            <button className="btn btn-dark rounded-0 " style={{ width: "25%", height: '40px' }} onClick={() => toggleCondition(1)}>아이디, 이름, 이메일</button>
                            <button className="btn btn-dark rounded-0  ms-4" style={{ width: "25%", height: '40px' }} onClick={() => toggleCondition(2)}>연락처, 주소</button>
                            <button className="btn btn-dark rounded-0  ms-4" style={{ width: "25%", height: '40px' }} onClick={() => toggleCondition(3)}>포인트, 가입일</button>
                            <button className="btn btn-dark rounded-0 mt-3 ms-4" style={{ width: "25%", height: '40px' }} onClick={() => toggleCondition(4)}>차단된 회원</button>
                            <button className="btn btn-dark rounded-0 mt-3 ms-4" style={{ width: "25%", height: '40px' }} onClick={() => toggleCondition(5)}>정렬방식</button>
                        </div>

                        {/* 조건들 */}
                        {activeCondition === 1 && (
                            <div className="mt-2">
                                <div className="row">
                                    <label className="col-sm-3 col-form-label">아이디</label>
                                    <div className="col-sm-9">
                                        <input type="text" className="form-control rounded-0"
                                            name="memberId" value={input.memberId}
                                            onChange={changeInputString} />
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <label className="col-sm-3 col-form-label">이름</label>
                                    <div className="col-sm-9">
                                        <input type="text" className="form-control rounded-0"
                                            name="memberName" value={input.memberName}
                                            onChange={changeInputString} />
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <label className="col-sm-3 col-form-label">이메일</label>
                                    <div className="col-sm-9">
                                        <input type="email" className="form-control rounded-0"
                                            name="memberEmail" value={input.memberEmail}
                                            onChange={changeInputString} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeCondition === 2 && (
                            <div className="mt-2">
                                <div className="row">
                                    <label className="col-sm-3 col-form-label">연락처</label>
                                    <div className="col-sm-9">
                                        <input type="text" className="form-control rounded-0"
                                            name="memberContact" value={input.memberContact}
                                            onChange={changeInputString} />
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <label className="col-sm-3 col-form-label">주소</label>
                                    <div className="col-sm-9">
                                        <input type="text" className="form-control rounded-0"
                                            name="memberAddress" value={input.memberAddress}
                                            onChange={changeInputString} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeCondition === 3 && (
                            <div className="mt-2">
                                <div className="row">
                                    <label className="col-sm-3 col-form-label">포인트</label>
                                    <div className="col-sm-9 d-flex">
                                        <input type="text" className="form-control rounded-0"
                                            name="minMemberPoint" value={input.minMemberPoint}
                                            onChange={changeInputNumber} />
                                        <span className="mx-2">
                                            <PiTildeBold />
                                        </span>
                                        <input type="text" className="form-control rounded-0"
                                            name="maxMemberPoint" value={input.maxMemberPoint}
                                            onChange={changeInputNumber} />
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <label className="col-sm-3 col-form-label">가입일</label>
                                    <div className="col-sm-9 d-flex">
                                        <input type="date" className="form-control rounded-0"
                                            name="beginMemberJoinDate" value={input.beginMemberJoinDate}
                                            onChange={changeInputString} />
                                        <span className="mx-2">
                                            <PiTildeBold />
                                        </span>
                                        <input type="date" className="form-control rounded-0"
                                            name="endMemberJoinDate" value={input.endMemberJoinDate}
                                            onChange={changeInputString} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeCondition === 4 && (
                            <div className="mt-2">
                                <div className="row">
                                    <label className="col-sm-3 col-form-label">차단 여부</label>
                                    <div className="col-sm-9">
                                        <input
                                            type="checkbox"
                                            className="form-check-input rounded-0"
                                            name="isBlocked"
                                            checked={input.isBlocked}
                                            onChange={e => setInput({ ...input, isBlocked: e.target.checked })}
                                        />
                                        <span className="ms-1">차단된 회원만 보기</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeCondition === 5 && (
                            <div className="mt-2">
                                <div className="row">
                                    <label className="col-sm-3 col-form-label">정렬방식</label>
                                    <div className="col-sm-9">
                                        <div className="row">
                                            <div className="col-6">
                                                <label>
                                                    <input type="checkbox"
                                                        className="form-check-input rounded-0"
                                                        onChange={() => changeOrder("member_id ASC")} />
                                                    <span className="ms-1">아이디 오름차순</span>
                                                </label>
                                            </div>
                                            <div className="col-6">
                                                <label>
                                                    <input type="checkbox"
                                                        className="form-check-input rounded-0"
                                                        onChange={() => changeOrder("member_id DESC")} />
                                                    <span className="ms-1">아이디 내림차순</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-6">
                                                <label>
                                                    <input type="checkbox"
                                                        className="form-check-input rounded-0"
                                                        onChange={() => changeOrder("member_name ASC")} />
                                                    <span className="ms-1">이름 오름차순</span>
                                                </label>
                                            </div>
                                            <div className="col-6">
                                                <label>
                                                    <input type="checkbox"
                                                        className="form-check-input rounded-0"
                                                        onChange={() => changeOrder("member_name DESC")} />
                                                    <span className="ms-1">이름 내림차순</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}



                <table className="table mt-4 table-hover">
                    <thead>
                        <tr>
                            <th>아이디</th>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>가입일</th>
                        </tr>
                    </thead>
                    <tbody>
                        {result.memberList.map(member => (
                            <tr key={member.memberId} onClick={() => handleMemberClick(member.memberId)}>
                                <td>{member.memberId}</td>
                                <td>{member.memberName}</td>
                                <td>{member.memberEmail}</td>
                                <td>{member.memberJoinDate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {result.memberList.length > 0 && (
                    <div className="row mt-4">
                        <div className="col">
                            <nav>
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-0" onClick={() => handlePageClick(page - 1)}>이전</button>
                                    </li>
                                    {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
                                        const pageNum = startPage + index;
                                        return (
                                            <li className={`page-item ${page === pageNum ? 'active' : ''}`} key={pageNum}>
                                                <button className="page-link rounded-0" onClick={() => handlePageClick(pageNum)}>{pageNum}</button>
                                            </li>
                                        );
                                    })}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button className="page-link rounded-0" onClick={() => handlePageClick(page + 1)}>다음</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberSearch;
