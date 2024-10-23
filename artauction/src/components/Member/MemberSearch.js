import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { throttle } from "lodash";
import { PiTildeBold } from "react-icons/pi";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { FaChevronDown } from "react-icons/fa";

const MemberSearch = () => {
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
    });

    const [result, setResult] = useState({
        count: 0,
        last: true,
        memberList: []
    });

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
        if (page >= 2) {
            sendMoreRequest();
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
    const sendRequest = useCallback(async () => {
        loading.current = true;
        
        const resp = await axios.post("http://localhost:8080/member/search", {
            ...input,
            beginRow: (page - 1) * size,
            endRow: page * size
        });

        setResult(prevResult => ({
            ...prevResult,
            last: resp.data.last,
            memberList: page === 1 ? resp.data.memberList : [...prevResult.memberList, ...resp.data.memberList],
            count: resp.data.count 
        }));

        loading.current = false;
    }, [input, page]);
    const sendMoreRequest = useCallback(async () => {
        loading.current = true;
        const resp = await axios.post("http://localhost:8080/member/search", input);
        setResult({
            ...result,
            last: resp.data.last,
            memberList: [...result.memberList, ...resp.data.memberList]
        });
        loading.current = false;
    }, [input.beginRow, input.endRow]);
    const setFirstPage = useCallback(() => {

        setPage(prev => null);
        setTimeout(() => {
            setPage(prev => 1);
        }, 1);

    }, [page]);

    useEffect(() => {
        if (page === null) return;
        if (result.last === true) return;

        const resizeHandler = throttle(() => {
            const percent = getScrollPercent();
            console.log("percent = " + percent);
            if (percent >= 70 && loading.current === false) {
                setPage(page + 1);
            }
        }, 250);

        window.addEventListener("scroll", resizeHandler);

        return () => {
            window.removeEventListener("scroll", resizeHandler);
        };
    });
    const getScrollPercent = useCallback(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / documentHeight) * 100;
        return scrollPercent;
    });

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };
    const loading = useRef(false);

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
            <label className="col-sm-3 col-form-label">등급</label>
            <div className="col-sm-9">
                <label>
                    <input type="checkbox" className="form-check-input"
                        name="memberRankList" value="회원"
                        onChange={changeInputArray} />
                    <span className="ms-1">일반회원</span>
                </label>
                <label className="ms-4">
                    <input type="checkbox" className="form-check-input"
                        name="memberRankList" value="관리자"
                        onChange={changeInputArray} />
                    <span className="ms-1">관리자</span>
                </label>
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
                        <li className="list-group-item" key={member.memberId}>
                            <h3>{member.memberId}</h3>
                            <div className="row">
                                <div className="col-3">이름</div>
                                <div className="col-3">{member.memberName}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">이메일</div>
                                <div className="col-3">{member.memberEmail}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">연락처</div>
                                <div className="col-3">{member.memberContact}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">등급</div>
                                <div className="col-3">{member.memberRank}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">포인트</div>
                                <div className="col-3">{member.memberPoint}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">주소</div>
                                <div className="col-9">
                                    {member.memberPost !== null && (<>
                                        [{member.memberPost}]
                                        {member.memberAddress1}
                                        {member.memberAddress2}
                                    </>)}
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-3">가입일</div>
                                <div className="col-3">{member.memberJoinDate}</div>
                            </div>
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