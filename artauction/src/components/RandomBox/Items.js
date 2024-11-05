import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { Modal } from "bootstrap";
import { NavLink } from "react-router-dom";
import { useRecoilState } from "recoil";
import { memberRankState } from "../../utils/recoil";
import "../../index.css";

const Items = () => {
    const [item, setItem] = useState([]);
    const [result, setResult] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // 버튼 비활성화 상태
    const [memberRank, setMemberRank] = useRecoilState(memberRankState);
    const [boxClass, setBoxClass] = useState("random-box");

    // 페이지 로드 시 아이템 목록 로드
    useEffect(() => {
        loadItems();
    }, []);

    // 랜덤박스 열기 함수
    const openRandomBox = useCallback(async () => {
        if (isButtonDisabled) return;

        try {
            setIsButtonDisabled(true);
            setBoxClass("random-box shake"); // 흔들리는 애니메이션 시작

            setTimeout(async () => {
                const resp = await axios.get("http://localhost:8080/item/randomBox");
                if(resp.data.length===0){
                    alert("포인트 부족");
                }
                setResult(resp.data);

                if (resp.data.isWin === "Y") {
                    deleteItem(resp.data.itemId);
                    loadItems();
                }

                setBoxClass("random-box explode"); // 터지는 애니메이션

                // 3초 후 결과를 숨기고 랜덤박스를 다시 보이게 설정
                setTimeout(() => {
                    setResult(null); // 결과 숨기기
                    setBoxClass("random-box"); // 랜덤박스 초기화
                    setIsButtonDisabled(false); // 버튼 활성화
                }, 3000);
            }, 1000);
        } catch (error) {
            console.error("Error opening random box:", error);
        }
    }, [isButtonDisabled]);

    // 아이템 삭제 함수
    const deleteItem = useCallback(async (itemId) => {
        await axios.delete(`http://localhost:8080/item/${itemId}`);
    }, []);

    // 아이템 목록 로드 함수
    const loadItems = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/item/list");
        setItem(resp.data);
    }, []);

    // 등록 상태 관리
    const [insert, setInsert] = useState({
        auctionNo: ""
    });

    // 등록 입력 처리 함수
    const insertInput = useCallback((e) => {
        setInsert({
            ...insert,
            [e.target.name]: e.target.value
        });
    }, [insert]);

    // 등록 저장 함수
    const saveInsertInput = useCallback(async () => {
        await axios.post("http://localhost:8080/item/", insert);
        clearInsertInput();
        closeInsertModal();
    }, [insert]);

    // 등록 입력 초기화
    const clearInsertInput = useCallback(() => {
        setInsert({
            auctionNo: ""
        });
    }, [insert]);

    // 모달 관리
    const insertModal = useRef();

    const openInsertModal = useCallback(() => {
        const tag = Modal.getOrCreateInstance(insertModal.current);
        tag.show();
    }, [insertModal]);

    const closeInsertModal = useCallback(() => {
        const tag = Modal.getInstance(insertModal.current);
        tag.hide();
        clearInsertInput();
    }, [insertModal]);

    return (
        <>
            
            <div className="row mt-3">
                {memberRank === '관리자' && (
                    <div className="col text-end">
                        <button className="btn btn-secondary" onClick={openInsertModal}>아이템 추가하기</button>
                    </div>
                )}
            </div>

            <table className="table">
                <thead>
                    <tr>
                        <td>작품명</td>
                        <td>확률</td>
                        <td>가치</td>
                    </tr>
                </thead>
                <tbody>
                    {item.map(item => (
                        <tr key={item.itemId}>
                            <td>{item.itemName}</td>
                            <td>{item.chance}%</td>
                            <td>약 {item.itemValue.toLocaleString()}원</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div
    className={boxClass}
    onClick={openRandomBox} // 클릭 이벤트 추가
    style={{ cursor: isButtonDisabled ? 'not-allowed' : 'pointer' }} // 비활성화 시 커서 스타일 변경
>    
    </div>

            {result && (
                <div className="result-box">
                    <h2>결과:</h2>
                    <p>작품명: {result.itemName}</p>
                    <p>아이템 가치: {result.itemValue.toLocaleString()}원</p>
                    <p>당첨 여부: {result.isWin === 'Y' ? '당첨' : '다음 기회에...'}</p>
                    {result.isWin === 'Y' && (
                        <NavLink className="nav-link" to="/member/mypage">마이 페이지로 이동</NavLink>
                    )}
                </div>
            )}

            {/* 모달 */}
            <div className="modal fade" tabIndex="-1" ref={insertModal} data-bs-backdrop="static">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">랜덤박스 등록</h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                                onClick={closeInsertModal}
                            ></button>
                        </div>

                        <div className="modal-body">
                            <div className="row mt-4">
                                <div className="col">
                                    <label>옥션 번호</label>
                                    <input
                                        type="text"
                                        className="form-control mb-4"
                                        name="auctionNo"
                                        value={insert.auctionNo}
                                        onChange={insertInput}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary btn-manual-close"
                                onClick={closeInsertModal}
                            >
                                취소
                            </button>
                            <button type="button" className="btn btn-success" onClick={saveInsertInput}>
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Items;
