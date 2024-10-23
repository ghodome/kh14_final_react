import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { throttle } from "lodash";
import { PiTildeBold } from "react-icons/pi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MemberSearch = () => {
    const navigate = useNavigate();
    const [basicSearch, setBasicSearch] = useState({
        keyword: "",
        column: "member_id" 
    });
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
    });
    
    const [result, setResult] = useState({
        count: 0,
        last: true,
        memberList: []
    });
    
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);

    useEffect(() => {
        setInput({
            ...input,
            beginRow: page * size - (size - 1),
            endRow: page * size
        });
    }, [page, size]);

    useEffect(() => {
        if (page === null) return;

        if (page === 1) {
            sendRequest();
        }
    }, [input.beginRow, input.endRow]);

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
    const changeInputArray = useCallback(e => {
        const origin = input[e.target.name];

        if (e.target.checked === true) {
            setInput({
                ...input,
                [e.target.name]: origin.concat(e.target.value)
            });
        }
        else {
            setInput({
                ...input,
                [e.target.name]: origin.filter(rank => rank !== e.target.value)
            });
        }
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
        loading.current = true;

        const resp = await axios.post("http://localhost:8080/member/search", {
            ...input,
            beginRow: (page - 1) * size,
            endRow: page * size,
        });
        const filteredMemberList = resp.data.memberList.filter(member => member.memberRank !== '관리자');

        setResult(prevResult => ({
            ...prevResult,
            last: resp.data.last,
            memberList: page === 1 ? filteredMemberList : [...prevResult.memberList, ...filteredMemberList],
            count: resp.data.count,
        }));
        loading.current = false;
    }, [input, page]);

    

    const setFirstPage = useCallback(() => {

        setPage(prev => null);
        setTimeout(() => {
            setPage(prev => 1);
        }, 1);

    }, [page]);

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };
    const loading = useRef(false);
    const handleMemberClick = (memberId) => {
        navigate(`/member/${memberId}`);
    };
    

    return (<>
        <Jumbotron title="회원 조회" />
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
                <button className="btn btn-success w-100"
                    onClick={setFirstPage}>
                    <FaMagnifyingGlass />
                    <span className="ms-2">이 조건으로 상세 검색하기</span>
                </button>
            </div>
        </div>

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
    </>);
};

export default MemberSearch;