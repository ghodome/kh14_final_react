import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { PiTildeBold } from "react-icons/pi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

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

        setPage(1);
        await sendRequest();
    };

    const handleSearchColumnChange = (e) => {
        setSearchColumn(e.target.value);
    };

    useEffect(() => {
        sendRequest();
    }, [input, page]);

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
            endRow: page * size - 1,
        });

        const allMembers = resp.data.memberList;
        const filteredMemberList = allMembers.filter(member => member.memberRank !== '관리자');

        setResult({
            last: resp.data.last,
            memberList: filteredMemberList,
            count: resp.data.count,
        });
    }, [basicSearch, input, page, searchColumn]);

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
    };

    const handleMemberClick = (memberId) => {
        navigate(`/admin/member/detail/${memberId}`);
    };

    return (
        <>
            <Jumbotron title="회원 조회" />
            <div className="row mt-4">
                <label className="col-sm-3 col-form-label">기본 검색</label>
                <div className="col-sm-9 d-flex">
                    <select className="form-select form-select-sm me-2"
                        onChange={handleSearchColumnChange} value={searchColumn}>
                        <option value="member_id">아이디</option>
                        <option value="member_name">이름</option>
                        <option value="member_email">이메일</option>
                    </select>
                    <input
                        type="text"
                        className="form-control ms-2"
                        value={basicSearch.keyword}
                        onChange={handleBasicSearchChange}
                    />
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <button className="btn btn-success w-100" onClick={handleBasicSearch}>
                        <FaMagnifyingGlass />
                        <span className="ms-2">기본 검색</span>
                    </button>
                </div>
            </div>
            <button className="btn btn-primary" onClick={openModal}>
                복합 검색
            </button>

            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="복합 검색">
                <h2>복합검색</h2>
                <form onSubmit={handleComplexSearch}>
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">아이디</label>
                        <div className="col-sm-9">
                            <input type="text" className="form-control"
                                name="memberId" value={input.memberId}
                                onChange={changeInputString} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">이름</label>
                        <div className="col-sm-9">
                            <input type="text" className="form-control"
                                name="memberName" value={input.memberName}
                                onChange={changeInputString} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">연락처</label>
                        <div className="col-sm-9">
                            <input type="tel" className="form-control"
                                name="memberContact" value={input.memberContact}
                                onChange={changeInputString} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">이메일</label>
                        <div className="col-sm-9">
                            <input type="email" className="form-control"
                                name="memberEmail" value={input.memberEmail}
                                onChange={changeInputString} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">포인트</label>
                        <div className="col-sm-9 d-flex">
                            <input type="text" className="form-control"
                                name="minMemberPoint" value={input.minMemberPoint}
                                onChange={changeInputNumber} />
                            <span className="mx-2">
                                <PiTildeBold />
                            </span>
                            <input type="text" className="form-control"
                                name="maxMemberPoint" value={input.maxMemberPoint}
                                onChange={changeInputNumber} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">주소</label>
                        <div className="col-sm-9">
                            <input type="text" className="form-control"
                                name="memberAddress" value={input.memberAddress}
                                onChange={changeInputString} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">가입일</label>
                        <div className="col-sm-9 d-flex">
                            <input type="date" className="form-control"
                                name="beginMemberJoinDate" value={input.beginMemberJoinDate}
                                onChange={changeInputString} />
                            <span className="mx-2">
                                <PiTildeBold />
                            </span>
                            <input type="date" className="form-control"
                                name="endMemberJoinDate" value={input.endMemberJoinDate}
                                onChange={changeInputString} />
                        </div>
                    </div>
                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">차단 여부</label>
                        <div className="col-sm-9">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="isBlocked"
                                checked={input.isBlocked}
                                onChange={e => setInput({ ...input, isBlocked: e.target.checked })}
                            />
                            <span className="ms-1">차단된 회원만 보기</span>
                        </div>
                    </div>

                    <div className="row mt-4">
                        <label className="col-sm-3 col-form-label">정렬방식</label>
                        <div className="col-sm-9">
                            <div className="col-sm-9">
                                <label>
                                    <input type="checkbox"
                                        className="form-check-input"
                                        onChange={() => changeOrder("member_id ASC")} />
                                    <span className="ms-1">아이디 오름차순</span>
                                </label>
                                <label className="ms-4">
                                    <input type="checkbox"
                                        className="form-check-input"
                                        onChange={() => changeOrder("member_id DESC")} />
                                    <span className="ms-1">아이디 내림차순</span>
                                </label>
                                <label className="ms-4">
                                    <input type="checkbox"
                                        className="form-check-input"
                                        onChange={() => changeOrder("member_name ASC")} />
                                    <span className="ms-1">이름 오름차순</span>
                                </label>
                                <label className="ms-4">
                                    <input type="checkbox"
                                        className="form-check-input"
                                        onChange={() => changeOrder("member_name DESC")} />
                                    <span className="ms-1">이름 내림차순</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col">
                            <button type="submit" className="btn btn-success">
                                검색
                            </button>
                        </div>
                    </div>
                </form>
                <button className="btn btn-secondary" onClick={closeModal}>
                    닫기
                </button>
            </Modal>

            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group">
                        {result.memberList.map(member => (
                            <li
                                className="list-group-item"
                                key={member.memberId}
                                onClick={() => handleMemberClick(member.memberId)}
                                style={{ cursor: 'pointer' }}
                            >
                                <h3>{member.memberId}({member.memberName})</h3>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {modalIsOpen ? null : (
                <div className="row mt-4">
                    <div className="col">
                        <nav>
                            <ul className="pagination justify-content-center">
                                {[...Array(Math.ceil(result.count / size)).keys()].map(num => (
                                    <li className={`page-item ${page === num + 1 ? 'active' : ''}`} key={num}>
                                        <button className="page-link" onClick={() => handlePageClick(num + 1)}>
                                            {num + 1}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

export default MemberSearch;
