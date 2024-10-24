import { useCallback, useRef, useState } from 'react';
import Jumbotron from '../Jumbotron';
import { useEffect } from 'react';
import axios from 'axios';
import { Modal } from "bootstrap";
import { useNavigate } from 'react-router-dom';
import moment from "moment";
import "moment/locale/ko";  //moment 한국어 정보 불러오기
moment.locale("ko");  //moment에 한국어를 기본 언어로 설정

const AuctionSchedule = ()=>{
    //navigator
    const navigate = useNavigate();

    // state
    const [auctionScheduleList, setAuctionScheduleList] = useState([]);

    // 등록 state
    const [insert, setInsert] = useState({
        auctionScheduleTitle : "",
        auctionScheduleStartDate : "",
        auctionScheduleEndDate : "",
        auctionScheduleState : "",
        auctionScheduleNotice : ""
    });

    useEffect(()=>{
        loadAuctionScheduleList();
    }, []);

    //callback
    const loadAuctionScheduleList = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/auctionSchedule/");
        setAuctionScheduleList(resp.data);
    }, [auctionScheduleList]);

    // 등록
    const insertInput = useCallback(e=>{
        setInsert({
            ...insert,
            [e.target.name] : e.target.value
        });
    }, [insert]);

    const saveInsertInput = useCallback(async ()=>{
        const resp = await axios.post("http://localhost:8080/auctionSchedule/");
        setAuctionScheduleList(resp.data);
        clearInsertInput();
        closeInsertModal();
    }, [insert]);

    const clearInsertInput = useCallback(()=>{
        setInsert({
            auctionScheduleTitle : "",
            auctionScheduleStartDate : "",
            auctionScheduleEndDate : "",
            auctionScheduleState : "", 
            auctionScheduleNotice : ""
        });
    }, [insert]);

    // 입력 모달
    const insertModal = useRef();

    const openInsertModal = useCallback(()=>{
        const tag = Modal.getOrCreateInstance(insertModal.current);
        tag.show();
    }, [insertModal]);

    const closeInsertModal = useCallback(()=>{
        const tag = Modal.getInstance(insertModal.current);
        tag.hide();
        clearInsertInput();
    }, [insertModal]);


    return (<>
        <Jumbotron title="경매 일정" content="예정/진행/종료경매 목록"/>

        <div className="row mt-4">
            <div className="col" >

                    <div className="row">
                        <div className="col">
                            <div className="d-flex flex-row mt-2 mb-2">
                                <button className="btn btn-outline-info me-2">진행경매</button>
                                <button className="btn btn-outline-info me-2">예정경매</button>
                                <button className="btn btn-outline-info me-2">종료경매</button>
                                
                                <div className="d-flex flex-reverse ms-2">
                                    <button className="btn btn-outline-primary" 
                                            onClick={openInsertModal}>경매등록</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 경매 일정 목록 */}
                    {auctionScheduleList.map((auctionSchedule)=>(
                        <div className="row" key={auctionSchedule.auctionScheduleNo}>

                            <div className="col-9 p-4 d-flex flex-column position-static">
                                <div className="d-flex flex-row mb-2">
                                {auctionSchedule.auctionScheduleState === '진행경매' &&(
                                    <div className="badge text-bg-success text-wrap">{auctionSchedule.auctionScheduleState}</div>
                                )}
                                {auctionSchedule.auctionScheduleState === '예정경매' &&(
                                    <div className="badge text-bg-info text-wrap">{auctionSchedule.auctionScheduleState}</div>
                                )}
                                {auctionSchedule.auctionScheduleState === '종료경매' &&(
                                    <div className="badge text-bg-secondary text-wrap">{auctionSchedule.auctionScheduleState}</div>
                                )}
                                </div>
                                <div className="d-flex flex-row">
                                    <h3>{auctionSchedule.auctionScheduleTitle}</h3>
                                </div>
                                <div className="d-flex flex-row">
                                    <div className="p-2">경매시작일</div>
                                    <div className="p-2">
                                        {moment(auctionSchedule.auctionScheduleStartDate).format("yyyy/MM/DD (dd) a hh:mm")}</div>
                                </div>
                                <div className="d-flex flex-row">
                                    <div className="p-2">경매종료일</div>
                                    <div className="p-2">
                                        {moment(auctionSchedule.auctionScheduleEndDate).format("yyyy/MM/DD (dd) a hh:mm")}
                                    </div>
                                </div>

                                <div className="d-flex flex-row mt-2 mb-2">
                                {auctionSchedule.auctionScheduleState === '진행경매' &&(
                                    <button className="btn btn-outline-secondary mt-2 col-3"
                                        onClick={e=>navigate("/auctionList/"+auctionSchedule.auctionScheduleNo)}>상세보기</button>
                                )}
                                {auctionSchedule.auctionScheduleState !== '진행경매' &&(
                                    <button className="btn btn-outline-secondary mt-2 col-3"
                                            onClick={e=>navigate("/auctionschedule/detail/"+auctionSchedule.auctionScheduleNo)}>상세보기</button>
                                )}
                                </div>
                                     
                            </div>
                                
                            <div className="col-3 p-4">
                                <img src="https://placehold.co/200" className="img-thumbnail" alt=""/> 
                            </div>
                            
                            <hr/>  

                        </div>
                    ))}

                    {/* 경매 일정 등록 모달 */}
                    <div className="modal fade" tabIndex="-1"
                                ref={insertModal} data-bs-backdrop="static">
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        경매 일정 등록
                                    </h5>
                                    <button type="button" className="btn-close" 
                                        data-bs-dismiss="modal" aria-label="Close"
                                        onClick={closeInsertModal}>
                                    <span aria-hidden="true"></span>
                                    </button>
                                </div>

                                <div className="modal-body">
                                    {/* 경매 일정 등록 */}
                                    <div className="row mt-4">
                                        <div className="col">
                                            <label>경매 일정명</label>
                                            <input type="text" className="form-control mb-4" 
                                                    name="auctionScheduleTitle" value={insert.auctionScheduleTitle} 
                                                    onChange={insertInput}/>
                                            
                                            <label>일정 시작일</label>
                                            <input type="datetime-local" className="form-control mb-4" 
                                                    name="auctionScheduleStartDate" value={insert.auctionScheduleStartDate} 
                                                    onChange={insertInput}/>

                                            <label>일정 종료일</label>
                                            <input type="datetime-local" className="form-control mb-4" 
                                                    name="auctionScheduleEndDate" value={insert.auctionScheduleEndDate} 
                                                    onChange={insertInput}/>
                                            
                                            <label>일정 상태</label>
                                            <select className="form-select mb-4" name="auctionScheduleState" 
                                                    value={insert.auctionScheduleState} onChange={insertInput}>
                                                <option value="">선택하세요</option>
                                                <option>예정경매</option>
                                                <option>진행경매</option>
                                                <option>종료경매</option>
                                            </select>

                                            <label>안내사항</label>
                                            <textarea type="text" className="form-control mb-4" 
                                                    name="auctionScheduleNotice" value={insert.auctionScheduleNotice} 
                                                    onChange={insertInput}/>

                                            <label>이미지 첨부</label>
                                            {/* <input type="file" id="input" multiple /> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary btn-manual-close" 
                                                onClick={closeInsertModal}>취소</button>
                                <button type="button" className="btn btn-success"
                                                onClick={saveInsertInput}>등록</button>
                                   
                                </div>
                            </div>
                        </div>
                    </div>
                    

            </div>
        </div>

    </>);

};

export default AuctionSchedule;
