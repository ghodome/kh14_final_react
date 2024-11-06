import { useCallback, useEffect, useMemo, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { NavLink } from "react-router-dom";

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
    return (
        <>
                <h2 className="text-center">포기 물품</h2>
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
                                {list.length === 0 ? (
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                <td>
                                    <h2>낙찰 포기 상품이 없습니다</h2>
                                </td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                    ) : (
                                    list.map(item => (
                                        <tr key={item.dealNo}>
                                            <td>{item.dealBuyer}</td>
                                            <td>{item.dealNo}</td>
                                            <td>{item.workTitle}</td>
                                            <td>{item.dealPrice.toLocaleString()}원</td>
                                            <td>{item.dealCancelTime}</td>
                                            <td>{item.dealStatus}</td>
                                        </tr>
                                    )))}
                                </tbody>
                            </table>
                        </div>
                    </div>
               
        </>
    );
};

export default Giveup;