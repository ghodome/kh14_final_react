import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import { useNavigate, useParams } from "react-router-dom";
import { useRecoilState } from "recoil";
import { blockedState } from "../../utils/recoil";

const MemberDetail = () => {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [blocked, setBlocked] = useRecoilState(blockedState);
    const [blockReason, setBlockReason] = useState(localStorage.getItem(`blockReason_${memberId}`) || null);

    useEffect(() => {
        loadMember();
    }, [memberId]);

    const loadMember = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:8080/member/${memberId}`);
            setMember(resp.data);
            setBlocked(resp.data.blocked);
            if (resp.data.blocked) {
                setBlockReason(localStorage.getItem(`blockReason_${memberId}`) || null);
            }
        } catch (error) {
            setError("회원 정보를 불러오는 데 실패했습니다.");
            navigate("/");
        } finally {
            setLoading(false);
        }
    }, [memberId, navigate]);

    const handleDelete = useCallback(async () => {
        const confirmDelete = window.confirm("정말 삭제하시겠습니까?");
        if (!confirmDelete) return;
        try {
            await axios.delete(`http://localhost:8080/member/delete/${memberId}`);
            navigate("/admin/member/list");
        } catch (error) {
            console.error("Failed to delete member:", error);
            alert("탈퇴에 실패했습니다. 다시 시도해 주세요.");
        }
    }, [memberId, navigate]);

    const handleBlock = useCallback(async () => {
        const blockReasonInput = prompt("차단 사유를 입력하세요:");
        if (!blockReasonInput) {
            alert("차단 사유를 입력해야 합니다.");
            return;
        }
        const confirmBlock = window.confirm("정말 차단하시겠습니까?");
        if (!confirmBlock) return;

        try {
            await axios.post(`http://localhost:8080/member/block`, {
                blockMemberId: memberId,
                blockReason: blockReasonInput,
                blockType: "차단",
                blockTime: new Date().toISOString(),
            });
            setBlocked(true);
            setBlockReason(blockReasonInput);
            localStorage.setItem(`blockReason_${memberId}`, blockReasonInput); // 차단 사유 저장
            alert("회원이 차단되었습니다.");
        } catch (error) {
            console.error("Failed to block member:", error);
            alert("차단에 실패했습니다. 다시 시도해 주세요.");
        }
    }, [memberId]);

    const handleUnblock = useCallback(async () => {
        const confirmUnblock = window.confirm("정말 차단 해제하시겠습니까?");
        if (!confirmUnblock) return;

        try {
            await axios.delete(`http://localhost:8080/member/unblock/${memberId}`);
            setBlocked(false);
            setBlockReason(null);
            localStorage.removeItem(`blockReason_${memberId}`); // localStorage에서 차단 사유 제거
            alert("회원이 차단 해제되었습니다.");
        } catch (error) {
            console.error("Failed to unblock member:", error);
            alert("차단 해제에 실패했습니다. 다시 시도해 주세요.");
        }
    }, [memberId]);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <>
            <Jumbotron title={`${member.memberName}님의 정보`} />
            <div className="row mt-4">
                <div className="col-3">아이디</div>
                <div className="col-3">{member.memberId}</div>
            </div>
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

            {blocked && blockReason && (
                <div className="row mt-4">
                    <div className="col-3">차단 사유</div>
                    <div className="col-3">{blockReason}</div>
                </div>
            )}

            <div className="row mt-4">
                <div className="col">
                    <button type="button" className="btn btn-primary" onClick={() => navigate(`/admin/member/edit/${memberId}`)}>
                        수정하기
                    </button>
                    <button type="button" className="btn btn-danger ms-5" onClick={handleDelete}>
                        계정 삭제
                    </button>
                    {!blocked ? (
                        <button type="button" className="btn btn-warning ms-5" onClick={handleBlock}>
                            회원 차단
                        </button>
                    ) : (
                        <button type="button" className="btn btn-secondary ms-5" onClick={handleUnblock}>
                            차단 해제
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default MemberDetail;
