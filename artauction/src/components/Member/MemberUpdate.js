import { useNavigate, useParams } from "react-router-dom";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const MemberUpdate = () => {
    const navigate = useNavigate();

    const [member, setMember] = useState({
        memberPw: "",
        memberName: "",
        memberEmail: "",
        memberContact: "",
        memberPost: "",
        memberAddress1: "",
        memberAddress2: ""
    });

    useEffect(() => {
        loadMember();
        loadDaumPostcode();
    }, []);

    const loadDaumPostcode = () => {
        const script = document.createElement("script");
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        document.body.appendChild(script);
    };

    const loadMember = useCallback(async () => {
        const token = localStorage.getItem("accessToken");
        const resp = await axios.get(`http://localhost:8080/member/find`);
        setMember(resp.data);
    }, []);

    const changeInput = useCallback(e => {
        const { name, value } = e.target;
        setMember(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updateMember = {
            memberPw: member.memberPw || undefined,
            memberName: member.memberName || undefined,
            memberEmail: member.memberEmail || undefined,
            memberContact: member.memberContact || undefined,
            memberPost: member.memberPost || undefined,
            memberAddress1: member.memberAddress1 || undefined,
            memberAddress2: member.memberAddress2 || undefined,
        };

        

        await axios.patch("http://localhost:8080/member/update", updateMember);
        navigate("/myPage");
    };

    const sample6_execDaumPostcode = () => {
        if (!window.daum) {
            console.error("Daum Postcode API가 로드되지 않았습니다.");
            return;
        }

        new window.daum.Postcode({
            oncomplete: function(data) {
                const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                const extraAddr = data.userSelectedType === 'R' ? 
                    (data.bname ? data.bname : '') + (data.buildingName ? `, ${data.buildingName}` : '') : 
                    '';

                setMember(prev => ({
                    ...prev,
                    memberPost: data.zonecode,
                    memberAddress1: addr,
                    memberAddress2: extraAddr
                }));
            }
        }).open();
    };

    return (
        <>
            <Jumbotron title={`${member.memberName} 님의 정보수정`} />
            <div className="row mt-4">
                <div className="col-md-6 offset-md-3">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input type="password"
                                name="memberPw"
                                value={member.memberPw}
                                onChange={changeInput}
                                placeholder="비밀번호"
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberName"
                                value={member.memberName}
                                onChange={changeInput}
                                placeholder="이름"
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="email"
                                name="memberEmail"
                                value={member.memberEmail}
                                onChange={changeInput}
                                placeholder="이메일"
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberContact"
                                value={member.memberContact}
                                onChange={changeInput}
                                placeholder="전화번호"
                                className="form-control"
                            />
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberPost"
                                value={member.memberPost}
                                placeholder="우편번호"
                                className="form-control"
                                readOnly
                            />
                            <button type="button" onClick={sample6_execDaumPostcode} className="btn btn-primary mt-2">우편번호 찾기</button>
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberAddress1"
                                value={member.memberAddress1}
                                onChange={changeInput}
                                placeholder="일반주소"
                                className="form-control"
                                readOnly
                            />
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberAddress2"
                                value={member.memberAddress2}
                                onChange={changeInput}
                                placeholder="상세주소"
                                className="form-control"
                            />
                        </div>
                        <button className="btn btn-success w-100">수정 완료</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default MemberUpdate;
