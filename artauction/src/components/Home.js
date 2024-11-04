import { useCallback, useEffect, useState } from "react";
import Jumbotron from "./Jumbotron";
import axios from "axios";
import ImageSlider from "./ImageSlider";


const Home=()=>{
    
    const [rankList,setRankList] = useState([]);
    
    const sendRankList = useCallback(async()=>{
        const resp = await axios.get("http://localhost:8080/payment/rank");
        setRankList(resp.data);
    },[]);
    
    useEffect(()=>{
        sendRankList();
    },[]);

    //view
    return (<>
        <Jumbotron title="홈페이지"/>
        
        <div className="mt-4">
            <ImageSlider/>
        </div>

        <div className="row mt-4">
            <div className="col-6">d</div>
            <div className="col-6">
                <ul className="navbar-nav me-auto">
                    <li className="nav-item dropdown">
                       <h2>최고 거래 물품</h2>
                    </li>
                    {rankList.map(rank=>(
                    <li className="nav-item dropdown" key={rank.paymentDetailNo}>
                        작품명 : {rank.paymentDetailName} <br/>
                        낙찰자 : {rank.memberId}님<br/>
                        낙찰가 : {rank.paymentDetailPrice.toLocaleString()} 원<hr/>
                    </li>
                    ))}
                </ul>
            </div>
        </div>
    </>)
}

export default Home;