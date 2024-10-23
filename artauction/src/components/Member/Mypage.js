import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import { useNavigate } from "react-router-dom";

const Mypage = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState({});

    useEffect(() => {
        loadMember();
    }, []);

    const loadMember = useCallback(async () => {
        try {
            const resp = await axios.get("http://localhost:8080/member/find");
            setMember(resp.data);
        } catch (error) {
            console.error("Failed to load member data:", error);
            navigate("/login"); // 로그인 페이지로 리다이렉트
        }
    }, [navigate]);

    const handleDelete = useCallback(async () => {
        const confirmDelete = window.confirm("정말 탈퇴하시겠습니까?");
        if (!confirmDelete) {
            return; 
        }
    
        try {
            await axios.delete("http://localhost:8080/member/delete/" + member.memberId);
            navigate("/login");
        } catch (error) {
            console.error("Failed to delete member:", error);
            // 추가적인 오류 처리 가능
        }
    }, [member.memberId, navigate]);
    return (
        <>
            <Jumbotron title={`${member.memberName} 님의 정보`} />

            <div className="row mt-4">
                <div className="col-3">이름</div>
                <div className="col-3">{member.memberName}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">이메일</div>
                <div className="col-3">{member.memberEmail}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">연락처</div>
                <div className="col-3">{member.memberContact}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">등급</div>
                <div className="col-3">{member.memberRank}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">포인트</div>
                <div className="col-3">{member.memberPoint}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">우편번호</div>
                <div className="col-3">[{member.memberPost}]</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">주소</div>
                <div className="col-3">
                    {member.memberAddress1} {member.memberAddress2}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <button type="button" className="btn btn-primary" onClick={() => navigate("/member/update")}>
                        수정하기
                    </button>
                    <button type="button" className="btn btn-danger ms-5" onClick={handleDelete}>
                        탈퇴하기
                    </button>
                </div>
            </div>
        </>
    );
}

export default Mypage;
