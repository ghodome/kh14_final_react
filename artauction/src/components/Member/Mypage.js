import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

const Mypage = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState([]);
    const [inventoryId, setInventoryId] = useState(null);
    const [itemList, setItemList] = useState([]);

    useEffect(() => {
        loadMember();
        loadInven();
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

    const loadInven = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/inventory/find");
        setItemList(resp.data);
    }, []);

    const handleDelete = useCallback(async () => {
        const confirmDelete = window.confirm("정말 탈퇴하시겠습니까?");
        if (!confirmDelete) return;

        try {
            await axios.delete("http://localhost:8080/member/delete/" + member[0].memberId);
            navigate("/login");
        } catch (error) {
            console.error("Failed to delete member:", error);
        }
    }, [member, navigate]);

    const saveInsertInput = useCallback(async () => {
        await axios.delete(`http://localhost:8080/inventory/${inventoryId}`);
        clearInsertInput();
        closeInsertModal();
        alert("수령 완료 배달이 시작됩니다");
    }, [inventoryId]);

    const insertModal = useRef();

    const openInsertModal = useCallback((inventoryId) => {
        setInventoryId(inventoryId);
        const tag = Modal.getOrCreateInstance(insertModal.current);
        tag.show();
    }, [insertModal]);

    const closeInsertModal = useCallback(() => {
        const tag = Modal.getInstance(insertModal.current);
        tag.hide();
        clearInsertInput();
    }, [insertModal]);

    const clearInsertInput = useCallback(() => {
        setInventoryId(null);
    }, []);

    return (<>
        <div className="row">
            <div className="col-md-6 offset-md-3">
        <div className="row mt-4">
            <div className="col mb-4">
                <span style={{ fontWeight: 'bold', fontSize: '50px' }}>
                    {`${member[0]?.memberName || ''} 님의 정보`}
                </span>
            </div>
        </div>

                <div className="container my-4">
                    <div className="row mt-4">
                        <div className="col-4 border p-2">
                            <strong>이름</strong>
                        </div>
                        <div className="col-8 border p-2">
                            {member[0]?.memberName || ''}
                        </div>
                        <div className="col-4 border p-2">
                            <strong>이메일</strong>
                        </div>
                        <div className="col-8 border p-2">
                            {member[0]?.memberEmail || ''}
                        </div>

                        <div className="col-4 border p-2">
                            <strong>연락처</strong>
                        </div>
                        <div className="col-8 border p-2">
                            {member[0]?.memberContact || ''}
                        </div>
                        <div className="col-4 border p-2">
                            <strong>등급</strong>
                        </div>
                        <div className="col-8 border p-2">
                            {member[0]?.memberRank || ''}
                        </div>


                            <div className="col-4 border p-2">
                                <strong>포인트</strong>
                            </div>
                            <div className="col-8 border p-2">
                                {member[0]?.memberPoint.toLocaleString()}
                            </div>
                            <div className="col-4 border p-2">
                                <strong>우편번호</strong>
                            </div>
                            <div className="col-8 border p-2">
                                [{member[0]?.memberPost || ''}]
                            </div>




                        <div className="col-4 border p-2">
                            <strong>주소</strong>
                        </div>
                        <div className="col-8 border p-2">
                            {member[0]?.memberAddress1 || ''} {member[0]?.memberAddress2 || ''}
                        </div>

                    </div>


                    <div className="row mt-4">
                        <div className="col text-center">
                            <button type="button" className="btn btn-dark me-3 rounded-0" style={{ width: "25%", height: '40px' }} onClick={() => navigate("/member/update")}>
                                수정하기
                            </button>
                            <button type="button" className="btn btn-secondary me-3 mb-3 rounded-0" style={{ width: "25%", height: '40px' }} onClick={() => navigate("/member/pwChange")}>
                                비밀번호 변경
                            </button>
                            <button type="button" className="btn btn-light rounded-0" style={{ width: "25%", height: '40px' }} onClick={handleDelete}>
                                탈퇴하기
                            </button>
                        </div>
                    </div>



                    <div className="row mt-4">
                        <div className="col-6">
                            <h4 className="text-dark">내 미술품 목록</h4>
                            <table className="table table-striped table-borderless">
                                <thead className="table-dark">
                                    <tr>
                                        <th>작품명</th>
                                        <th>작가</th>
                                        <th>낙찰가</th>
                                        <th>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {member.length > 0 && member[0].dealNo > 0 ? (
                                        member.map(deal => (
                                            <tr key={deal.dealNo}>
                                                <td>{deal.workTitle}</td>
                                                <td>{deal.artistName}</td>
                                                <td>{deal.dealPrice.toLocaleString()}원</td>
                                                <td>{deal.dealStatus}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center">미술품이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="col-6">
                            <h4 className="text-dark">당첨된 랜덤박스 아이템 목록</h4>
                            <table className="table table-striped table-borderless">
                                <thead className="table-dark">
                                    <tr>
                                        <th>작품명</th>
                                        <th>추정가</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemList.length > 0 && itemList[0].itemId > 0 ? (
                                        itemList.map((item) => (
                                            <tr key={item.itemId}>
                                                <td>{item.itemName}</td>
                                                <td>{item.itemValue.toLocaleString()}원</td>
                                                <td>
                                                    <button className="btn btn-dark rounded-0" onClick={e => openInsertModal(item.inventoryId)}>수령하기</button>
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
                </div>

                {/* 모달 */}
                <div className="modal fade" tabIndex="-1" ref={insertModal} data-bs-backdrop="static">
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">상품 수령하기</h5>
                                <button type="button" className="btn btn-close rounded-0" data-bs-dismiss="modal" aria-label="Close" onClick={closeInsertModal}>
                                    <span aria-hidden="true"></span>
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="row mt-4">
                                    <div className="col">
                                        <label>주소 확인하기</label>
                                        <input type="input" className="form-control mb-4" value={member[0]?.memberPost || ''} readOnly />
                                        <label>주소</label>
                                        <input type="input" className="form-control mb-4" value={member[0]?.memberAddress1 || ''} readOnly />
                                        <input type="input" className="form-control mb-4" value={member[0]?.memberAddress2 || ''} readOnly />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary rounded-0 btn-manual-close" onClick={closeInsertModal}>취소</button>
                                <button type="button" className="btn btn-dark rounded-0" onClick={saveInsertInput}>수령하기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}

export default Mypage;
