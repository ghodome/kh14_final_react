import { useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";

const MemberSearch = () =>{
    const [input, setInput] = useState({
        memberId : "",
        memberName : "",
        memberBirth : "",
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
        count:0,
        last: true,
        memberList: []
    });

    const [page, setPage] = useState(null);
    const [size, setSize] = useState(10);

    useEffect(()=>{
        setInput({
            ...input,
            beginRow : page * size - (size-1)
        })
    })

    return(<>
    <Jumbotron title="회원 조회" />
    <div className="row mt-4">
        <div className="col">

        </div>
    </div>
    </>);
};

export default MemberSearch;