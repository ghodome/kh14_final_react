import axios from "axios";
import { useCallback, useEffect, useState } from "react";

const PaymentCancel = ()=>{

    const [detailList,setDetailList] = useState([]);

    useEffect(()=>{
        loadList();
    },[]);
    const [cancelList,setCancelList] = useState([]);
    const loadList = useCallback(async()=>{
        const resp = await axios.get("http://localhost:8080/payment/detailList");
        setDetailList(resp.data);
    },[]);
    const cancel = useCallback(async(detail)=>{
        try {
            const cancelData = {
                paymentDetailPrice: detail.paymentDetailPrice,
                paymentDetailOrigin: detail.paymentDetailOrigin,
                paymentDetailNo: detail.paymentDetailNo,
            };
            setCancelList(cancelData); // 상태는 여전히 업데이트하되, post 요청에 직접 전달
            // cancelData를 바로 사용하여 post 요청 전송
            const resp = await axios.post("http://localhost:8080/payment/cancel", cancelData);
            alert("환불이 완료되었습니다.");
        } catch (error) {
            alert("환불에 실패했습니다.");
        }
       
    },[]);
    
    return(<>
        <div className="mt-4">
            <div className="col">
            <table className="table">
                <thead>
                    <tr>
                        <th>개별 구매상품 번호(paymentDetailNo)</th>
                        <th>사용자명</th>
                        <th>작품명</th>
                        <th>가격</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {detailList.map(detail=>(
                    <tr key={detail.paymentDetailNo}>
                        <td>{detail.paymentDetailNo}</td>
                        <td>{detail.memberId}</td>
                        <td>{detail.paymentDetailName}</td>
                        <td>{detail.paymentDetailPrice.toLocaleString()}원</td>
                        <td><button className="btn btn-dark" onClick={() => cancel(detail)}>환불하기</button></td>
                    </tr>
                    ))}
                </tbody>
            </table>


            </div>
        </div>
    </>);
};
export default PaymentCancel;