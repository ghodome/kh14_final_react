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
     const [auctionSchedule, setAuctionSchedule] = useState(null);
     const [load, setLoad] = useState(false);

     const [input, setInput] = useState({
        auctionScheduleNo : "",
        auctionScheduleTitle : "",
        auctionScheduleStartDate : "",
        auctionScheduleEndDate : "",
        auctionScheduleState : ""
    });

    //effect
    useEffect(()=>{
        loadAuctionSchedule();
    }, []);

    //callback
    const loadAuctionSchedule = useCallback(async ()=>{
        try {
            const resp = await axios.get("http://localhost:8080/auctionSchedule/"+auctionScheduleNo);
            setAuctionSchedule(resp.data);
        }
        catch(e) {
            setAuctionSchedule(null);
        }
        setLoad(true);
    }, [auctionSchedule, auctionScheduleNo]);

    const changeInput = useCallback(e=>{
        setInput({
            ...input,
            [e.target.name] : e.target.value
        })
    }, [input]);

    // const editAuctionSchedule = useCallback(async ()=>{
    //     await axios.put("http://localhost:8080/auctionSchedule/", input);
    //     changeInput();
    //     loadAuctionSchedule();
    // }, [auctionSchedule, input]);


    const deleteAuctionSchedule = useCallback(async ()=>{
        await axios.delete("http://localhost:8080/auctionSchedule/"+auctionScheduleNo);
        navigate("/auctionschedule");
    }, [auctionSchedule, auctionScheduleNo]);


    //view
    if(load === false) {
        return (<>
            <Jumbotron title="?번 경매 일정 상세정보"/>

            <div className="row mt-4">
                <div className="col-sm-3">
                    경매 일정명
                </div>
                <div className="col-sm-9">
                    <span className="placeholder col-6"></span>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    일정 시작일
                </div>
                <div className="col-sm-9">
                <span className="placeholder col-4"></span>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    일정 종료일
                </div>
                <div className="col-sm-9">
                <span className="placeholder col-4"></span>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    일정 상태
                </div>
                <div className="col-sm-9">
                    <span className="placeholder col-3"></span>
                </div>
            </div>

            {/* 각종 버튼들 */}
            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-secondary ms-2">목록보기</button>
                    <button className="btn btn-warning ms-2">수정하기</button>
                    <button className="btn btn-danger ms-2">삭제하기</button>
                </div>
            </div>
        </>);
    }
    if(auctionSchedule === null) {
        return <Navigate to="/notFound"/>
    }

    //view. 2-(1)
    return (<>
        <Jumbotron title={auctionScheduleNo +"번 경매 일정 상세정보"}/>

        <div className="row mt-4">
            <div className="col-sm-3">
                경매 일정명
            </div>
            <div className="col-sm-9">
                {auctionSchedule.auctionScheduleTitle}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col-sm-3">
                일정 시작일
            </div>
            <div className="col-sm-9">
                {auctionSchedule.auctionScheduleStartDate}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col-sm-3">
                일정 종료일
            </div>
            <div className="col-sm-9">
                {auctionSchedule.auctionScheduleEndDate}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col-sm-3">
                일정 상태
            </div>
            <div className="col-sm-9">
                {auctionSchedule.auctionScheduleState}
            </div>
        </div>

        {/* 각종 버튼들 */}
        <div className="row mt-4">
            <div className="col text-end">
                <button className="btn btn-secondary ms-2" 
                                onClick={e=>navigate("/auctionschedule")}>목록보기</button>
                    {/* <button className="btn btn-warning ms-2" 
                                onClick={editAuctionSchedule}>수정하기</button> */}
                    <button className="btn btn-danger ms-2" 
                                onClick={deleteAuctionSchedule}>삭제하기</button>
            </div>
        </div>
    

    </>)

};

export default AuctionScheduleDetail;