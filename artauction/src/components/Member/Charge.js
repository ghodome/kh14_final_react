import { useState } from "react";
import Jumbotron from "../Jumbotron";

const Charge = ()=>{
    const [money, setMoney] = useState(0);


    const chargeMoney = useState(async()=>{
        
    },[money]);
    //view
    return(<>
    <Jumbotron title="포인트 충전"/>
        <div className="row mt-4">
            <div className="col-3"></div>
            <div className="col-6">
                <input className="form-control w-100" value={money.toLocaleString()}/>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 10000)}>+10,000</button>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 100000)}>+100,000</button>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 1000000)}>+1,000,000</button>
                <button className="btn btn-success float-end m-3">충전하기</button>
                <button className="btn btn-warning float-end m-3"onClick={e=>setMoney(0)}>초기화하기</button>
            </div>
        </div>
    </>);
};
export default Charge;