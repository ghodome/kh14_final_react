import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AuctionList = ()=>{
    const {auctionScheduleNo} = useParams();
    const [auctionList,setAuctionList] = useState([]);
    const navigate = useNavigate();
    const loadAuctionList = useCallback(async()=>{
        const resp = await axios.get(`http://localhost:8080/auction/${auctionScheduleNo}`)
        setAuctionList(resp.data);
    },[]);
    
    const detail = useCallback((target)=>{
        navigate(`/auction/detail/${target}`); 
    },[])
    useEffect(()=>{
        loadAuctionList();
    },[]);
    
    return (<>
        <Jumbotron title={`옥션 스케쥴 넘버 : ${auctionScheduleNo}`} />
        <div className="row mt-4">
            {auctionList.map(list=>(
                <div className="col-3" key={list.auctionNo}>
                    <h4>{list.auctionNo}</h4>
                    <p onClick={e=>detail(list.auctionNo)}>사진</p>
                    <br/>
                    {list.artistName}
                    <br/>
                    작품명 {list.workTitle}
                    <br/>
                    작품 크기 {list.workSize}
                    <br/>
                    작품 분류 {list.workCategory}
                    <br/>
                    <hr/>
                    예상최저가 : {list.auctionLowPrice}원
                    <br/>
                    예상최고가 : {list.auctionHighPrice}원
                    <br/>
                    <hr/>
                    마감 : {list.auctionEndDate}
                    <br/>
                    {list.auctionState}
                </div>
            ))}
        </div>
    </>);
};
export default AuctionList;