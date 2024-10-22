import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";


const AuctionScheduleDetail = ()=>{
    //ref
    const presentModal=useRef();
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

    const [presentInput, setPresentInput]= useState({
        auctionScheduleNo:auctionScheduleNo
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

    const changePresentInput=useCallback((e)=>{
        setPresentInput({
            ...presentInput,
            [e.target.name]:e.target.value
        })
    },[presentInput])

    const editAuctionSchedule = useCallback(async ()=>{
        await axios.put("http://localhost:8080/auctionSchedule/", input);
        changeInput();
        loadAuctionSchedule();
    }, [auctionSchedule, input]);


    const deleteAuctionSchedule = useCallback(async ()=>{
        await axios.delete("http://localhost:8080/auctionSchedule/"+auctionScheduleNo);
        navigate("/auctionschedule");
    }, [auctionSchedule, auctionScheduleNo]);

    const registPresentInput=useCallback(async ()=>{
        const resp=await axios.post(`http://localhost:8080/auction/`,presentInput);
        if(resp.status===200) 
            window.alert("등록이완료되었습니다.");
        setPresentInput({
            auctionScheduleNo:auctionScheduleNo
        });
        closePresentModal();
    },[presentInput])
    const openPresentModal=useCallback(()=>{
        if(presentModal.current){
            const tag = Modal.getOrCreateInstance(presentModal.current);
            tag.show();
        }
    },[presentModal])

    const closePresentModal=useCallback(()=>{
        const tag = Modal.getInstance(presentModal.current);
        tag.hide();
    },[presentModal,registPresentInput])

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
                                onClick={openPresentModal}>출품 등록</button>
                <button className="btn btn-secondary ms-2" 
                                onClick={e=>navigate("/auctionschedule")}>목록보기</button>
                    <button className="btn btn-warning ms-2" 
                                onClick={editAuctionSchedule}>수정하기</button>
                    <button className="btn btn-danger ms-2" 
                                onClick={deleteAuctionSchedule}>삭제하기</button>
            </div>
        </div>
                    
        {/* 출품용 모달 */}
        <div className="modal fade" tabIndex="-1" ref={presentModal}>
        <div className="modal-dialog">
          <div className="modal-content">
          <div className="modal-header">
              <h5 className="modal-title">출품 등록</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closePresentModal}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col">
                    <label>작품 번호</label>
                    <input type="number" 
                    value={presentInput.workNo} 
                    name="workNo" 
                    className="form-control" 
                    onChange={e => changePresentInput(e)} 
                    placeholder="작품 번호"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>출품 번호</label>
                    <input type="number" 
                    name="auctionLot" 
                    className="form-control" 
                    value={presentInput.auctionLot} 
                    onChange={e => changePresentInput(e)} 
                    placeholder="출품 번호"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>예상 최저가</label>
                    <input type="number" 
                    name="auctionLowPrice" 
                    className="form-control" 
                    value={presentInput.auctionLowPrice} 
                    onChange={e => changePresentInput(e)} 
                    placeholder="예상 최저가"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>예상 최고가</label>
                    <input type="number" 
                    name="auctionHighPrice" 
                    className="form-control" 
                    value={presentInput.auctionHighPrice} 
                    onChange={e => changePresentInput(e)} 
                    placeholder="예상 최고가"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>위탁자</label>
                    <input type="text" 
                    name="auctionConsigner" 
                    className="form-control" 
                    value={presentInput.auctionConsigner} 
                    onChange={e => changePresentInput(e)} 
                    placeholder="위탁자"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>위탁 수수료</label>
                    <input type="number" 
                    name="auctionConsignmentFee" 
                    className="form-control" 
                    value={presentInput.auctionConsignmentFee} 
                    onChange={e => changePresentInput(e)} 
                    placeholder="숫자만"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>위탁 대금</label>
                    <input type="number" 
                    name="auctionNetProceeds" 
                    className="form-control" 
                    value={presentInput.auctionNetProceeds} 
                    onChange={e => changePresentInput(e)} 
                    placeholder="숫자만"
                    autoComplete="off"/>
                </div>
            </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-lg btn-success"
                onClick={registPresentInput}>
                등록
              </button>
              <button
                type="button"
                className="btn btn-lg btn-secondary"
                onClick={closePresentModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </>)

};

export default AuctionScheduleDetail;