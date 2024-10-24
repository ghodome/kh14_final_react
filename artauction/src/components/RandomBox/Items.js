import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { Modal } from "bootstrap";

const Items = () => {
    const [item, setItem] = useState([]);
    const [result, setResult] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false); // 버튼 비활성화 상태

    useEffect(() => {
        loadItems();
    }, []);

    const openRandomBox = useCallback(async()=>{
        if (isButtonDisabled) return; // 버튼이 비활성화된 경우 함수를 종료

        try {
            setIsButtonDisabled(true); // 버튼 비활성화
            const resp = await axios.get('http://localhost:8080/item/randomBox');
            setResult(resp.data);
            if(resp.data.isWin==='Y'){
                deleteItem(resp.data.itemId);
                loadItems();
            }
        } catch (error) {
            console.error('Error opening random box:', error);
        } finally {
            // 3초 후 버튼 활성화
            setTimeout(() => {
                setIsButtonDisabled(false);
            }, 1000);
        }
    },[result,isButtonDisabled]);

    const deleteItem = useCallback(async(itemId)=>{
        const resp = await axios.delete(`http://localhost:8080/item/${itemId}`);
    },[]);

    const loadItems = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/item/list");
        setItem(resp.data);
    }, []);
    // 등록 state
    const [insert, setInsert] = useState({
        itemName : "",
        itemValue : "",
        chance : "",
        isWin : "Y"
    });
     const insertInput = useCallback(e=>{
        setInsert({
            ...insert,
            [e.target.name] : e.target.value
        });
    }, [insert]);

    const saveInsertInput = useCallback(async ()=>{
        const resp = await axios.post("http://localhost:8080/item/",insert);
        clearInsertInput();
        closeInsertModal();
    }, [insert]);

    const clearInsertInput = useCallback(()=>{
        setInsert({
        itemName : "",
        itemValue : "",
        chance : "",
        isWin : ""
        });
    }, [insert]);
     // 입력 모달
     const insertModal = useRef();

     const openInsertModal = useCallback(()=>{
         const tag = Modal.getOrCreateInstance(insertModal.current);
         tag.show();
     }, [insertModal]);
 
     const closeInsertModal = useCallback(()=>{
         const tag = Modal.getInstance(insertModal.current);
         tag.hide();
         clearInsertInput();
     }, [insertModal]);
    // view
    return (
        <>
            <Jumbotron title="랜덤 뽑기" />
            <div className="row mt-3">
                <div className="col text-end">
                    <button className="btn btn-secondary" onClick={openInsertModal}>아이템 추가하기</button>
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <td>아이템 이름</td>
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
            <button
                className="btn btn-success w-100"
                onClick={openRandomBox}
                disabled={isButtonDisabled} // 버튼 비활성화 상태에 따라 비활성화
            >
                뽑기
            </button>
            {result && (
                <div>
                    <h2>결과:</h2>
                    <p>아이템 이름: {result.itemName}</p>
                    <p>아이템 가치: {result.itemValue}</p>
                    <p>당첨 여부: {result.isWin === 'Y' ? '당첨' : '다음 기회에...'}</p>
                </div>
            )}



            {/* 모달 */}
             <div className="modal fade" tabIndex="-1"
                                ref={insertModal} data-bs-backdrop="static">
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        랜덤박스 등록
                                    </h5>
                                    <button type="button" className="btn-close" 
                                        data-bs-dismiss="modal" aria-label="Close"
                                        onClick={closeInsertModal}>
                                    <span aria-hidden="true"></span>
                                    </button>
                                </div>

                                <div className="modal-body">
                                    {/* 랜덤박스 등록 */}
                                    <div className="row mt-4">
                                        <div className="col">
                                            <label>아이템 이름</label>
                                            <input type="text" className="form-control mb-4" 
                                                    name="itemName" value={insert.itemName} 
                                                    onChange={insertInput}/>
                                            
                                            <label>아이템 가격</label>
                                            <input type="number" className="form-control mb-4" 
                                                    name="itemValue" value={insert.itemValue} 
                                                    onChange={insertInput}/>

                                          <label>확률</label>
                                            <input type="number" className="form-control mb-4" 
                                                    name="chance" value={insert.chance} 
                                                    onChange={insertInput}/>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary btn-manual-close" 
                                                onClick={closeInsertModal}>취소</button>
                                <button type="button" className="btn btn-success"
                                                onClick={saveInsertInput}>등록</button>
                                   
                                </div>
                            </div>
                        </div>
                    </div>
        </>
    );
};

export default Items;
