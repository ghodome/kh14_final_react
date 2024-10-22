import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";


const AuctionScheduleDetail = ()=>{
     //parameter
     const {auctionScheduleNo} = useParams();

     //navigator
     const navigate = useNavigate();

     //state
     const [auctionSchedule, setAuctionSchedule] = useState({});

     const [input, setInput] = useState({
        auctionScheduleNo : "",
        auctionScheduleTitle : "",
        auctionScheduleStartDate : "",
        auctionScheduleEndDate : "",
        auctionScheduleState : "",
        auctionScheduleNotice : "",
    });

    //effect
    useEffect(()=>{
        loadAuctionSchedule();
    }, []);

    //callback
    const loadAuctionSchedule = useCallback(async ()=>{
            const resp = await axios.get("http://localhost:8080/auctionSchedule/"+auctionScheduleNo);
            setAuctionSchedule(resp.data);
    }, [auctionSchedule, auctionScheduleNo]);

    const changeInput = useCallback(e=>{
        setInput({
            ...input,
            [e.target.name] : e.target.value
        })
    }, [input]);

    const editAuctionSchedule = useCallback(async ()=>{
        await axios.put("http://localhost:8080/auctionSchedule/", input);
        changeInput();
        loadAuctionSchedule();
    }, [auctionSchedule, input]);


    const deleteAuctionSchedule = useCallback(async ()=>{
        await axios.delete("http://localhost:8080/auctionSchedule/"+auctionScheduleNo);
        navigate("/auctionschedule");
    }, [auctionSchedule, auctionScheduleNo]);

    
    //view
    return (<>
        <Jumbotron title={auctionScheduleNo +"번 경매 일정 상세정보"}/>

        <div className="container w-50">  

            <div className="row mt-4 text-center">
                <div className="col">
                    <img src="https://placehold.co/300" class="img-thumbnail" alt=""/>           
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    {auctionSchedule.auctionScheduleState === '진행경매' &&(
                        <div className="badge text-bg-success text-wrap">{auctionSchedule.auctionScheduleState}</div>
                    )}
                    {auctionSchedule.auctionScheduleState === '예정경매' &&(
                        <div className="badge text-bg-info text-wrap">{auctionSchedule.auctionScheduleState}</div>
                    )}
                    {auctionSchedule.auctionScheduleState === '종료경매' &&(
                        <div className="badge text-bg-secondary text-wrap">{auctionSchedule.auctionScheduleState}</div>
                    )}
                    <h3 className="mt-2">{auctionSchedule.auctionScheduleTitle}</h3>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    시작일
                </div>
                <div className="col-sm-9">
                    {auctionSchedule.auctionScheduleStartDate}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    종료일
                </div>
                <div className="col-sm-9">
                    {auctionSchedule.auctionScheduleEndDate}
                </div>
            </div>
            
            <div className="row mt-4">
                <div className="col-sm-3">
                    Notice
                </div>
                <div className="col-sm-9">
                    {auctionSchedule.auctionScheduleNotice}
                </div>
            </div>

        </div>

        {/* 각종 버튼들 */}
        <div className="row mt-4">
            <div className="col text-end">
                <button className="btn btn-secondary ms-2" 
                                onClick={e=>navigate("/auctionschedule")}>목록보기</button>
                    <button className="btn btn-warning ms-2" 
                                onClick={editAuctionSchedule}>수정하기</button>
                    <button className="btn btn-danger ms-2" 
                                onClick={deleteAuctionSchedule}>삭제하기</button>
            </div>
        </div>
    
    </>)

};

export default AuctionScheduleDetail;