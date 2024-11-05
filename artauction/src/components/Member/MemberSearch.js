import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
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
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    const openModal = () => setModalIsOpen(true);
    const closeModal = () => setModalIsOpen(false);

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
        await sendRequest();
    };

    const handleSearchColumnChange = (e) => {
        setSearchColumn(e.target.value);
    };

    useEffect(() => {
        sendRequest();
    }, [page]);


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

    const handleComplexSearch = async (e) => {
        e.preventDefault();
        setBasicSearch({
            keyword: "",
            column: "member_id"
        });
        setPage(1);
        await sendRequest();
        closeModal();
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
        sendRequest();
    };

    const handleMemberClick = (memberId) => {
        navigate(`/admin/member/detail/${memberId}`);
    };

    const totalPages = Math.ceil(result.count / size);
    const startPage = Math.max(1, page - 4);
    const endPage = Math.min(totalPages, page + 4);

    return (
        <>
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <Jumbotron title="회원 조회" />

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
                        <button className="btn btn-secondary w-100 rounded-0 mt" onClick={openModal}>
                            상세 조건
                        </button>
                    </div>


                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="상세 조건"
                        style={{
                            content: {
                                backgroundColor: 'white',
                                color: 'black',
                                top: '50%',
                                left: '50%',
                                right: 'auto',
                                bottom: 'auto',
                                marginRight: '-50%',
                                transform: 'translate(-50%, -50%)',
                                width: '650px',
                                height: 'auto',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
                            }
                        }}>
                        <h2>복합검색</h2>
                        <form onSubmit={handleComplexSearch}>

                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label">아이디</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control rounded-0"
                                        name="memberId" value={input.memberId}
                                        onChange={changeInputString}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label">이름</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control rounded-0"
                                        name="memberName" value={input.memberName}
                                        onChange={changeInputString}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label">연락처</label>
                                <div className="col-sm-9">
                                    <input type="tel" className="form-control rounded-0"
                                        name="memberContact" value={input.memberContact}
                                        onChange={changeInputString}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label">이메일</label>
                                <div className="col-sm-9">
                                    <input type="email" className="form-control rounded-0"
                                        name="memberEmail" value={input.memberEmail}
                                        onChange={changeInputString}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label">포인트</label>
                                <div className="col-sm-9 d-flex">
                                    <input type="text" className="form-control rounded-0"
                                        name="minMemberPoint" value={input.minMemberPoint}
                                        onChange={changeInputNumber}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                    <span className="mx-2">
                                        <PiTildeBold />
                                    </span>
                                    <input type="text" className="form-control rounded-0"
                                        name="maxMemberPoint" value={input.maxMemberPoint}
                                        onChange={changeInputNumber}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label">주소</label>
                                <div className="col-sm-9">
                                    <input type="text" className="form-control rounded-0"
                                        name="memberAddress" value={input.memberAddress}
                                        onChange={changeInputString}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label">가입일</label>
                                <div className="col-sm-9 d-flex">
                                    <input type="date" className="form-control rounded-0"
                                        name="beginMemberJoinDate" value={input.beginMemberJoinDate}
                                        onChange={changeInputString}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                    <span className="mx-2">
                                        <PiTildeBold />
                                    </span>
                                    <input type="date" className="form-control rounded-0"
                                        name="endMemberJoinDate" value={input.endMemberJoinDate}
                                        onChange={changeInputString}
                                        style={{ backgroundColor: '#f5f5f5', border: '1px solid #888', color: '#333' }} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <label className="col-sm-3 col-form-label ">차단 여부</label>
                                <div className="col-sm-9">
                                    <input
                                        type="checkbox"
                                        className="form-check-input rounded-0"
                                        name="isBlocked"
                                        checked={input.isBlocked}
                                        onChange={e => setInput({ ...input, isBlocked: e.target.checked })}
                                        style={{ accentColor: '#888' }}
                                    />
                                    <span className="ms-1">차단된 회원만 보기</span>
                                </div>
                            </div>

                            <div className="row mt-2">
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

                            <div className="row mt-4">
                                <div className="col d-flex justify-content-between">
                                    <button className="btn btn-light rounded-0" onClick={closeModal} style={{ minWidth: '100px' }}>
                                        닫기
                                    </button>
                                    <button type="submit" className="btn btn-dark rounded-0" style={{ minWidth: '100px' }}>
                                        검색
                                    </button>
                                </div>
                            </div>
                        </form>

                    </Modal>

                    <table className="table mt-4">
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



                    {result.memberList.length > 0 && !modalIsOpen && (
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
        </>
    );
};

export default MemberSearch;
