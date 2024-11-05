import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { PiTildeBold } from "react-icons/pi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import './MemberSearch.css';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";

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
    const [activeCondition, setActiveCondition] = useState(1); // 상태추가: 어떤 조건이 활성화되어 있는지 추적

    const handleFindClick = async () => {
        setPage(1); // 페이지를 첫 페이지로 리셋
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
        setActiveCondition(1);
    }, [page, size]);  // 처음 로드될 때와 페이지 번호, 페이지 크기 변경 시 호출
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
            {/* 왼쪽 - 검색 결과 */}
            <div className="col-md-6">
                {/* 검색 결과 테이블 */}
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
                {/* 페이지네이션 */}
                {result.memberList.length > 0 && (
                    <div className="row mt-4">
                        <div className="col">
                            <nav>
                                <ul className="pagination justify-content-center">
                                    {/* 맨 앞 버튼 (<<) */}
                                    <li className="page-item" style={{ boxShadow: 'none', border: 'none', pointerEvents: page === 1 ? 'none' : 'auto' }}>
                                        <button
                                            className="page-link rounded-0"
                                            onClick={() => handlePageClick(1)}
                                            style={{
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                color: page === 1 ? 'inherit' : '',
                                            }}
                                        >
                                            <MdKeyboardDoubleArrowLeft />
                                        </button>
                                    </li>
                                    {/* 이전 버튼 */}
                                    <li className="page-item" style={{ border: 'none', pointerEvents: page === 1 ? 'none' : 'auto' }}>
                                        <button
                                            className="page-link rounded-0"
                                            onClick={() => handlePageClick(page - 1)}
                                            style={{
                                                boxShadow: 'none',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                            }}
                                        >
                                            <MdKeyboardArrowLeft />
                                        </button>
                                    </li>
                                    {/* 페이지 번호 */}
                                    {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
                                        const pageNum = startPage + index;
                                        return (
                                            <li className="page-item" key={pageNum} style={{ boxShadow: 'none', border: 'none' }}>
                                                <button
                                                    className="page-link rounded-0"
                                                    onClick={() => handlePageClick(pageNum)}
                                                    style={{
                                                        fontWeight: page === pageNum ? 'bold' : 'normal', // 현재 페이지는 글씨 두껍게
                                                        backgroundColor: 'transparent', // 배경색 제거
                                                        border: 'none', // 테두리 제거
                                                        color: page === pageNum ? '#000' : '', // 선택된 페이지만 색상 강조
                                                    }}
                                                >
                                                    {pageNum}
                                                </button>
                                            </li>
                                        );
                                    })}
                                    {/* 다음 버튼 */}
                                    <li className="page-item" style={{ border: 'none', pointerEvents: page === totalPages ? 'none' : 'auto' }}>
                                        <button
                                            className="page-link rounded-0"
                                            onClick={() => handlePageClick(page + 1)}
                                            style={{
                                                boxShadow: 'none',
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                            }}
                                        >
                                            <MdKeyboardArrowRight />
                                        </button>
                                    </li>
                                    {/* 맨 끝 버튼 (>>) */}
                                    <li className="page-item" style={{ boxShadow: 'none', border: 'none', pointerEvents: page === totalPages ? 'none' : 'auto' }}>
                                        <button
                                            className="page-link rounded-0"
                                            onClick={() => handlePageClick(totalPages)}
                                            style={{
                                                border: 'none',
                                                backgroundColor: 'transparent',
                                                color: page === totalPages ? 'inherit' : '',
                                            }}>
                                            <MdKeyboardDoubleArrowRight />
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                )}
            </div>
            {/* 오른쪽 - 검색 조건 */}
            <div className="col-md-6 mt-5">
                <div className="col-sm-12 advanced-filters-container">
                    {/* 상세 조건 버튼들 */}
                    <div className="advanced-filters-buttons text-center d-flex justify-content-center">
                        <select
                            className="form-select text-center rounded-0"
                            style={{ width: "40%", height: '40px' }}
                            value={activeCondition}
                            onChange={(e) => toggleCondition(parseInt(e.target.value))}
                        >
                            <option value={1}>아이디, 이름, 이메일</option>
                            <option value={2}>연락처, 주소</option>
                            <option value={3}>포인트, 가입일, 차단여부</option>
                            <option value={4}>정렬방식</option>
                        </select>
                    </div>

                    {/* 상세 조건들 */}
                    {activeCondition === 1 && (
                        <div className="mt-3">
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
                        <div className="mt-3">
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
                        <div className="mt-3">
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
                            {/* 차단 여부 조건 */}
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label">차단 여부</label>
                                <div className="col-sm-9 d-flex align-items-center">
                                    {/* 차단된 회원만 보기 체크박스 */}
                                    <div className="form-check form-check-inline">
                                        <input
                                            type="checkbox"
                                            className="form-check-input rounded-0"
                                            onChange={() => setInput({ ...input, isBlocked: !input.isBlocked })}
                                            checked={input.isBlocked}
                                        />
                                        <span className="ms-1">차단된 회원만 보기</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeCondition === 4 && (
                        <div className="mt-3">
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
                    {/* "찾기" 버튼 */}
                    <div className="text-end mt-4">
                        <button className="btn btn-dark rounded-0" style={{ width: "15%", height: '40px' }} onClick={handleFindClick}>찾기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MemberSearch;