import { useNavigate, useParams } from "react-router-dom";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const MemberEdit = () => {
    const navigate = useNavigate();
    const { memberId } = useParams(); // URL에서 memberId 가져오기

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
        script.onload = () => console.log("Daum Postcode API 로드 완료");
        script.onerror = () => console.error("Daum Postcode API 로드 실패");
        document.body.appendChild(script);
    };

    const loadMember = useCallback(async () => {
        
            const resp = await axios.get(`http://localhost:8080/member/${memberId}`);
            setMember(resp.data);
    }, [memberId, navigate]);

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
            memberId,
            memberPw: member.memberPw || undefined,
            memberName: member.memberName || undefined,
            memberEmail: member.memberEmail || undefined,
            memberContact: member.memberContact || undefined,
            memberPost: member.memberPost || undefined,
            memberAddress1: member.memberAddress1 || undefined,
            memberAddress2: member.memberAddress2 || undefined,
        };

        try {
            await axios.patch("http://localhost:8080/member/update", updateMember);
            alert("회원 정보가 수정되었습니다.");
            navigate(`/admin/member/detail/${memberId}`); // 수정 후 해당 회원 상세 페이지로 리다이렉트
        } catch (error) {
            console.error("Failed to update member data:", error);
            alert("회원 정보 수정에 실패했습니다.");
        }
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
            <Jumbotron title={`${member.memberName} 님의 정보 수정`} />
            <div className="row mt-4">
                <div className="col-md-6 offset-md-3">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input type="text"
                                name="memberName"
                                value={member.memberName}
                                onChange={changeInput}
                                placeholder="이름"
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input type="email"
                                name="memberEmail"
                                value={member.memberEmail}
                                onChange={changeInput}
                                placeholder="이메일"
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input type="text"
                                name="memberContact"
                                value={member.memberContact}
                                onChange={changeInput}
                                placeholder="전화번호"
                                className="form-control"
                                required
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
                        <button type="button" className="btn btn-secondary mt-2" onClick={() => navigate(`/admin/member/detail/${memberId}`)}>
                            취소
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default MemberEdit;
