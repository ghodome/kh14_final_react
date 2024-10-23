import { useCallback, useEffect, useMemo, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";

const Payment = () =>{
    //state
    const [dealList, setDealList] = useState([]);

    // //effect
    // useEffect(()=>{
    //     loadDealList();
    // }, []);

    // //callback
    // const loadDealList = useCallback(async ()=>{
    //     const resp = await axios.get("http://localhost:8080/deal/");
    //     //setDealList(resp.data);
    //     setDealList(resp.data.map(deal=>{
    //         return {
    //             ...deal, 
    //             select:false,//체크박스용 상태값 추가
    //             qty:1,//수량 선택용 상태값 추가
    //         }
    //     }));
    // }, []);

    // const selectDeal = useCallback((target, checked)=>{
    //     setDealList(dealList.map(deal=>{
    //         if(deal.dealId === target.dealId) {//내가 찾는 deal이면 select를 변화
    //             return {...deal, select:checked};
    //         }
    //         return {...deal};//아니면 그대로 반환
    //     }));
    // }, [dealList]);

    // const changedealQty = useCallback((target, qty)=>{
    //     setDealList(dealList.map(deal=>{
    //         if(deal.dealId === target.dealId) {
    //             return {...deal, qty: qty};
    //         }
    //         return {...deal};
    //     }));
    // }, [dealList]);



    // //memo - 체크된 deal 목록, 총 결제 예상 금액
    // const checkedDealList = useMemo(()=>{
    //     return dealList.filter(deal=>deal.select === true);
    // }, [dealList]);

    // const checkedDealTotal = useMemo(()=>{
    //     return checkedDealList.reduce((before, current)=>{
    //         //return 누적합계 + (현재도서가격 * 현재도서수량)
    //         return before + (current.dealPrice * current.qty);
    //     }, 0);
    // }, [checkedDealList]);
    const getCurrentUrl = useCallback(()=>{
        return window.location.origin + window.location.pathname + (window.location.hash||'');
    },[])

    const sendPurchaseRequest = useCallback(async()=>{
        // if(checkedDealList.length===0)return;
        const resp = await axios.post("http://localhost:8080/payment/purchase",
            {
                // dealList:checkedDealList,
                totalAmount : 900000,
                approvalUrl:getCurrentUrl()+"/success",
                cancelUrl:getCurrentUrl()+"/cancel",
                failUrl:getCurrentUrl()+"/fail",
            });
            //결제 페이지로 이동 전에 필요한 항목들을 모두 sessionStorage에 저장
            //[1]거래번호(tid)
            //[2]구매한 도서 목록
            window.sessionStorage.setItem("tid",resp.data.tid);
            // window.sessionStorage.setItem("checkedDealList",checkedDealList);원하든 결과로 저장이 안됨
            // window.sessionStorage.setItem("checkedDealList",JSON.stringify(checkedDealList)); //다시 돌려야됨
        // console.log(resp.data);
        window.location.href = resp.data.next_redirect_pc_url;
    // },[checkedDealList,getCurrentUrl]); //deal 되면 다시 이걸로 
    },[getCurrentUrl]);
    return (<>
        <Jumbotron title="결제 하기"/>
        <table className="table">
                    <thead>
                        <tr>
                            <th>선택</th>
                            <th>번호</th>
                            <th>제목</th>
                            <th>저자</th>
                            <th>가격</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                        {/* {dealList.map(deal=>(
                        <tr key={deal.dealId}>
                            <td>
                                <input type="checkbox" className="form-check-input"
                                    checked={deal.select}
                                    onChange={e=>selectDeal(deal, e.target.checked)}/>
                            </td>    
                            <td>{deal.dealId}</td>
                            <td>{deal.dealTitle}</td>
                            <td>{deal.dealAuthor}</td>
                            <td>{deal.dealPrice}원</td>
                        </tr> 
                        ))} */}
                        {/* 예비 */}
                        <tr>
                            <td></td>
                            <td>1</td>
                            <td>모나리자</td>
                            <td>레오나르도 다 빈치</td>
                            <td>1000000원</td>
                        </tr>
                    </tbody>
                </table>

                <div className="row mt-4">
            <div className="col">
                <button className="btn btn-success w-100" onClick={sendPurchaseRequest}>구매하기</button>
            </div>
        </div>
    </>);
};
export default Payment;