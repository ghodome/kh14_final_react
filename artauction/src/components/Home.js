import { useCallback, useEffect, useState } from "react";
import Jumbotron from "./Jumbotron";
import axios from "axios";
import ImageSlider from "./ImageSlider";


const Home=()=>{
    const [rankList,setRankList] = useState([]);
    
    const sendRankList = useCallback(async()=>{
        const resp = await axios.get("http://localhost:8080/deal/list");
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
                       <h2>최근 낙찰 물품</h2>
                    </li>
                    
                    <li className="nav-item dropdown" >
                        <table className="table table-striped table-borderless">
                        <thead className="table-dark">
                            <tr>
                                <th>작품명</th>
                                <th>낙찰자</th>
                                <th>낙찰가</th>
                                <th>낙찰 일자</th>
                                <th>작가명</th>
                            </tr>
                        </thead>
                        <tbody>
                    {rankList.length > 0 && rankList[0].dealNo > 0 ? (
                    rankList.map(rank=>(
                            <tr key={rank.dealNo}>
                                <td>{rank.workTitle}</td>
                                <td>{rank.dealBuyer}</td>
                                <td>{rank.dealPrice.toLocaleString()}원</td>
                                <td>{rank.dealTime}일</td>
                                <td>{rank.artistName}</td>
                            </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="text-center">최근 낙찰 물품이 없습니다.</td>
                    </tr>
                )}
                        </tbody>
                        </table>
                    </li>
                </ul>
            </div>
        </div>
    </>)
}

export default Home;