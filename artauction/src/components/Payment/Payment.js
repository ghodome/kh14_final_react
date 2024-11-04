import { useCallback, useEffect, useMemo, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { loginState, memberLoadingState } from "../../utils/recoil";

const Payment = () => {
    // state
    const [dealList, setDealList] = useState([]);

     // 로그인 관련 상태
     const login = useRecoilValue(loginState); //리코일 생기면 이걸로 ㄱㄱ
    // const login = true;
     const memberLoading = useRecoilValue(memberLoadingState);
    // effect
    useEffect(() => {
        if(login===true&&memberLoading===true){
        loadDealList();
        }
    }, [login,memberLoading]);

    // callback
    const loadDealList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/deal/");
        setDealList(resp.data.map(deal => ({
            ...deal,
            select: false, // 체크박스용 상태값 추가
        })));
    }, []);

    const selectDeal = useCallback((target, checked) => {
        setDealList(prevDealList =>
            prevDealList.map(deal =>
                deal.dealNo === target.dealNo ? { ...deal, select: checked } : deal
            )
        );
    }, []);

    // memo - 체크된 deal 목록, 총 결제 예상 금액
    const checkedDealList = useMemo(() => {
        return dealList.filter(deal => deal.select);
    }, [dealList]);

    const checkedDealTotal = useMemo(() => {
        return checkedDealList.reduce((total, deal) => total + deal.dealPrice, 0);
    }, [checkedDealList]);

    const getCurrentUrl = useCallback(() => {
        return window.location.origin + window.location.pathname + (window.location.hash || '');
    }, []);

    const sendPurchaseRequest = useCallback(async (dealList) => {
        if (dealList.length === 0) return;

        const resp = await axios.post("http://localhost:8080/payment/purchase", {
            dealList: dealList,
            approvalUrl: getCurrentUrl() + "/success",
            cancelUrl: getCurrentUrl() + "/cancel",
            failUrl: getCurrentUrl() + "/fail",
        });

        window.sessionStorage.setItem("tid", resp.data.tid);
        window.sessionStorage.setItem("checkedDealList", JSON.stringify(dealList));

        window.location.href = resp.data.next_redirect_pc_url;
    }, [getCurrentUrl]);
    //취소
    const sendGiveUp = useCallback(async(dealNo)=>{
        try{
            const resp = await axios.post("http://localhost:8080/deal/giveup/"+dealNo);
        }
        catch{
            console.log("오류남");
        }
        finally{
            alert("낙찰이 취소되었습니다");
            loadDealList();
        }

    },[]);

    const calculateDay = useCallback((dealDate) => {
        const startDate = new Date(dealDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7); // 7일 후의 마감일 계산
        const now = new Date();
        const timeDifference = endDate - now;
    
        if (timeDifference < 0) {
            return '마감일 지남'; // 이미 마감된 경우
        }
    
        const daysRemaining = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // 남은 일 수 계산
        if (daysRemaining < 1) {
            const hoursRemaining = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); // 남은 시간 계산
            return `${hoursRemaining}시간 남음`;
        }
    
        return `${daysRemaining}일 남음`;
    }, []);
    const changeEndTime = useCallback(async(dealTime)=>{
        // const resp = await axios.post("http://localhost:8080/");//이걸로 포인트 까고
    },[]);
    return (
        <>
            <Jumbotron title="결제 하기" />
            <table className="table">
                <thead>
                    <tr>
                        <th>선택</th>
                        <th>제목</th>
                        <th>저자</th>
                        <th>총 가격</th>
                        <th>포인트로 결제한 가격</th>
                        <th>결제 가격</th>
                        <th>낙찰 일자</th>
                        <th>남은 일수</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                    {dealList.map(deal => (
                        <tr key={deal.dealNo}>
                            <td>
                                <input type="checkbox" className="form-check-input"
                                    checked={deal.select}
                                    onChange={e => selectDeal(deal, e.target.checked)} />
                            </td>
                            <td>{deal.workTitle}</td>
                            <td>{deal.artistName}</td>
                            <td>{deal?.dealPrice.toLocaleString() || ''}원</td>
                            <td>{(deal?.dealPrice*0.3).toLocaleString() || ''}원</td>
                            <td>{(deal?.dealPrice*0.7).toLocaleString() || ''}원</td>
                            <td>{deal.dealTime}</td>
                            <td>{calculateDay(deal.dealTime)}</td>
                            <td>
                                <button className="btn btn-dark text-light" onClick={() => {
                                    sendPurchaseRequest([deal]); // 해당 항목만 결제
                                }}>결제</button>
                            </td>
                            <td>
                                <button className="btn btn-light text-dark" onClick={e=>sendGiveUp(deal.dealNo)}>결제 포기</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="row mt-4">
                <div className="col">
                    <h3>총 가격은 : {(checkedDealTotal*0.7)?.toLocaleString() || ''}원</h3>
                    <button className="btn btn-dark text-light w-100" onClick={() => sendPurchaseRequest(checkedDealList)}>결제하기</button>
                </div>
            </div>
            
        </>
    );
};

export default Payment;
