import { useCallback, useEffect, useMemo, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";

const Giveup = () =>{

    const [list,setList] = useState([]);



    useEffect(()=>{
        loadList();
    },[]);

    const loadList = useCallback(async()=>{
        const resp = await axios.get("http://localhost:8080/payment/giveup")
        setList(resp.data);
    },[]);


    //view
    return (<>
        <Jumbotron title="관리자용 폐기 물품 확인"/>
        <div className="row mt-4">
            <div className="col">
                <table className="table">
                    <thead>
                        <tr>
                            <th>포기한 유저</th>
                            <th>낙찰번호</th>
                            <th>작품명</th>
                            <th>가격</th>
                            <th>시간</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(list=>(
                        <tr key={list.dealNo}>
                            <td>{list.dealBuyer}</td>
                            <td>{list.dealNo}</td>
                            <td>{list.workTitle}</td>
                            <td>{list.dealPrice.toLocaleString()}원</td>
                            <td>{list.dealCancelTime}</td>
                            <td>{list.dealStatus}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>);
};
export default Giveup;