import { useCallback, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";

const Charge = ()=>{
    const [money, setMoney] = useState(0);
    const getCurrentUrl = useCallback(()=>{
        return window.location.origin + window.location.pathname + (window.location.hash||'');
    },[])

    const sendPurchaseRequest = useCallback(async ()=>{
        if(money === 0) return;

        const resp = await axios.post(
                    "http://localhost:8080/member/charge/purchase", 
                    {
                        totalAmount : money,
                        approvalUrl : getCurrentUrl() + "/success",
                        cancelUrl : getCurrentUrl() + "/cancel",
                        failUrl : getCurrentUrl() + "/fail",
                    }
        );
        
        console.log(resp.data);

        //결제 페이지 이동 전에 필요한 항목들을 모두 sessionStorage에 저장
        //[1] 거래번호(tid)
        window.sessionStorage.setItem("tid", resp.data.tid);
        //결제 페이지로 이동
        window.location.href = resp.data.next_redirect_pc_url;
    }, [money,getCurrentUrl]);
    //view
    return(<>
    <Jumbotron title="포인트 충전"/>
        <div className="row mt-4">
            <div className="col-3"></div>
            <div className="col-6">
                <input className="form-control w-100" value={money.toLocaleString()} readOnly/>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 10000)}>+10,000</button>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 100000)}>+100,000</button>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 1000000)}>+1,000,000</button>
                <button className="btn btn-success float-end m-3" onClick={sendPurchaseRequest}>충전하기</button>
                <button className="btn btn-warning float-end m-3"onClick={e=>setMoney(0)}>초기화하기</button>
            </div>
        </div>
    </>);
};
export default Charge;