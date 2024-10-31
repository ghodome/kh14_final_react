import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import { useNavigate } from "react-router-dom";
import { Modal } from "bootstrap";

const Mypage = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState([]);
    const [inventoryId, setinventoryId] = useState(null);

    useEffect(() => {
        loadMember();
    }, []);

    const loadMember = useCallback(async () => {
        try {
            const resp = await axios.get("http://localhost:8080/member/find");
            setMember(resp.data);
            console.log(resp.data);
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
            await axios.delete("http://localhost:8080/member/delete/" + member[0].memberId);
            navigate("/login");
        } catch (error) {
            console.error("Failed to delete member:", error);
            // 추가적인 오류 처리 가능
        }
    }, [member, navigate]);

    // 등록 state

    const saveInsertInput = useCallback(async () => {
        // console.log(inventoryId);
        const resp = await axios.delete(`http://localhost:8080/inventory/${inventoryId}`);
        clearInsertInput();
        closeInsertModal();
        alert("수령 완료 배달이 시작됩니다");
    }, [inventoryId]);

    // 입력 모달
    const insertModal = useRef();

    const openInsertModal = useCallback((inventoryId) => {
        setinventoryId(inventoryId);
        console.log("선택된 inventoryId:", inventoryId); // 설정된 inventoryId 확인용 콘솔 출력

        const tag = Modal.getOrCreateInstance(insertModal.current);
        tag.show();
    }, [insertModal]);

    const closeInsertModal = useCallback(() => {
        const tag = Modal.getInstance(insertModal.current);
        tag.hide();
        clearInsertInput();
    }, [insertModal]);

    const clearInsertInput = useCallback(() => {
        setinventoryId(null); // 모달 닫힐 때 inventoryId 초기화
    }, []);
    return (
        <>
            <Jumbotron title={`${member[0]?.memberName || ''} 님의 정보`} />

            <div className="row mt-4">
                <div className="col-3">이름</div>
                <div className="col-3">{member[0]?.memberName || ''}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">이메일</div>
                <div className="col-3">{member[0]?.memberEmail || ''}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">연락처</div>
                <div className="col-3">{member[0]?.memberContact || ''}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">등급</div>
                <div className="col-3">{member[0]?.memberRank || ''}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">포인트</div>
                <div className="col-3">{member[0]?.memberPoint || ''}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">우편번호</div>
                <div className="col-3">[{member[0]?.memberPost || ''}]</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">주소</div>
                <div className="col-3">
                    {member[0]?.memberAddress1 || ''} {member[0]?.memberAddress2 || ''}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <button type="button" className="btn btn-primary" onClick={() => navigate("/member/update")}>
                        수정하기
                    </button>
                    <button type="button" className="btn btn-secondary ms-5" onClick={() => navigate("/member/pwChange")}>
                        비밀번호 변경
                    </button>
                    <button type="button" className="btn btn-danger ms-5" onClick={handleDelete}>
                        탈퇴하기
                    </button>

                </div>
            </div>
            <div className="row mt-2">
                <div className="col-3"></div>
                <div className="col-6">
                    <h4>당첨된 아이템 목록</h4>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>작품명</th>
                                <th>추정가</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {member.length > 0 && member[0].itemId > 0 ? ( // member 배열이 비어있지 않고 첫 번째 아이템의 itemId가 0보다 큰 경우
                                member.map(item => (
                                    <tr key={item.itemId}>
                                        <td>{item.itemName}</td>
                                        <td>{item.itemValue.toLocaleString()}원</td>
                                        <td>
                                            <button className="btn btn-success" onClick={e => openInsertModal(item.inventoryId)}>수령하기</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">아이템이 없습니다.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 모달 */}
            <div className="modal fade" tabIndex="-1"
                ref={insertModal} data-bs-backdrop="static">
                <div className="modal-dialog">
                    <div className="modal-content">

                        <div className="modal-header">
                            <h5 className="modal-title">
                                상품 수령하기
                            </h5>
                            <button type="button" className="btn-close"
                                data-bs-dismiss="modal" aria-label="Close"
                                onClick={closeInsertModal}>
                                <span aria-hidden="true"></span>
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* 주소 확인하기 */}
                            <div className="row mt-4">
                                <div className="col">
                                    <label>주소 확인하기</label>
                                    <input type="input" className="form-control mb-4" value={member[0]?.memberPost || ''} readOnly />
                                    <input type="input" className="form-control mb-4" value={member[0]?.memberAddress1 || ''} readOnly />
                                    <input type="input" className="form-control mb-4" value={member[0]?.memberAddress2 || ''} readOnly />

                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary btn-manual-close"
                                onClick={closeInsertModal}>취소</button>
                            <button type="button" className="btn btn-success"
                                onClick={saveInsertInput}>수령하기</button>

                        </div>
                    </div>
                </div>
            </div>


        </>
    );
}

export default Mypage;
