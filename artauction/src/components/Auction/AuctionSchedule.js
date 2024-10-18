import { useCallback, useRef, useState } from 'react';
import Jumbotron from '../Jumbotron';
import { useEffect } from 'react';
import axios from 'axios';
import { FaAsterisk } from "react-icons/fa6";
import { FaRegSquarePlus } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { Modal } from "bootstrap";

const AuctionSchedule = ()=>{
    // state
    const [auctionScheduleList, setAuctionScheduleList] = useState([]);

    // 등록과 수정을 한번에 처리하기 위한 state
    const [input, setInput] = useState({
        auctionScheduleNo : "",
        auctionScheduleTitle : "",
        auctionScheduleStartDate : "",
        auctionScheduleEndDate : "",
        auctionScheduleState : ""
    });

    useEffect(()=>{
        loadAuctionScheduleList();
    }, []);

    //callback
    const loadAuctionScheduleList = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/auctionSchedule/");
        setAuctionScheduleList(resp.data);
    }, [auctionScheduleList]);

    // 등록 및 수정
    const changeInput = useCallback(e=>{
        setInput({
            ...input,
            [e.target.name] : e.target.value
        })
    }, [input]);

    const clearInput = useCallback(()=>{
        setInput({
            auctionScheduleNo : "",
            auctionScheduleTitle : "",
            auctionScheduleStartDate : "",
            auctionScheduleEndDate : "",
            auctionScheduleState : ""
        });
    }, [input]);

    // const saveInput = useCallback(async ()=>{
    //     const resp = await axios.post("http://localhost:8080/auctionSchedule/")
    //     setAuctionScheduleList(resp.data);
    //     clearInput();
    //     closeModal();
    // }, [input]);

    // 입력+수정 모달 Modal
    const modal = useRef();

    const openModal = useCallback(()=>{
        const tag = Modal.getOrCreateInstance(modal.current);
        tag.show();
    }, [modal]);

    const closeModal = useCallback(()=>{
        const tag = Modal.getInstance(modal.current);
        tag.hide();
        clearInput();
    }, [modal]);



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
                                            onClick={openModal}>경매등록</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 경매 일정 목록 */}
                    {auctionScheduleList.map((auctionSchedule)=>(
                        <div className="row" key={auctionSchedule.auctionScheduleNo}>

                            <div className="col-9 p-4 d-flex flex-column position-static">
                                <h3>{auctionSchedule.auctionScheduleTitle}</h3>
                                <div className="d-flex flex-row">
                                    <div className="p-2">경매시작일</div>
                                    <div className="p-2">{auctionSchedule.auctionScheduleStartDate}</div>
                                </div>
                                <div className="d-flex flex-row">
                                    <div className="p-2">경매종료일</div>
                                    <div className="p-2">{auctionSchedule.auctionScheduleEndDate}</div>
                                </div>
                                <button className="btn btn-outline-secondary mt-2 col-3">상세보기</button>
                            </div>

                            <div className="col-3 p-4">
                                <p>이미지</p>
                            </div>

                        </div>
                    ))}

                    {/* 경매 일정 등록 모달 */}
                    <div className="modal fade" tabIndex="-1"
                                ref={modal} data-bs-backdrop="static">
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {/* {addMode ? '경매 일정 등록' : '경매 일정 수정'} */}
                                    </h5>
                                    <button type="button" className="btn-close" 
                                        data-bs-dismiss="modal" aria-label="Close"
                                        onClick={closeModal}>
                                    <span aria-hidden="true"></span>
                                    </button>
                                </div>

                                <div className="modal-body">
                                    {/* 경매 일정 등록 */}
                                    <div className="row mt-4">
                                        <div className="col">
                                            <label>경매 일정명</label>
                                            <input type="text" className="form-control mb-4" 
                                                    name="auctionScheduleTitle" value={input.auctionScheduleTitle} 
                                                    onChange={changeInput}/>
                                            
                                            <label>일정 시작일</label>
                                            <input type="text" className="form-control mb-4" 
                                                    name="auctionScheduleStartDate" value={input.auctionScheduleStartDate} 
                                                    onChange={changeInput}/>

                                            <label>일정 종료일</label>
                                            <input type="text" className="form-control mb-4" 
                                                    name="auctionScheduleEndDate" value={input.auctionScheduleEndDate} 
                                                    onChange={changeInput}/>
                                            
                                            <label>일정 상태</label>
                                            <select className="form-select mb-4" name="auctionScheduleState" 
                                                    value={input.auctionScheduleState} onChange={changeInput}>
                                                <option value="">선택하세요</option>
                                                <option>예정경매</option>
                                                <option>진행경매</option>
                                                <option>종료경매</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary btn-manual-close" 
                                                onClick={closeModal}>취소</button>
                                    {/* {addMode ? (버튼) : (버튼)} */}
                                    {/* {addMode ? (
                                        <button type="button" className="btn btn-success"
                                                    onClick={saveBook}><FaRegSquarePlus />저장</button>
                                    ) : (
                                        <button type="button" className="btn btn-warning"
                                        onClick={updateBook}><FaEdit />수정</button>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </div>

                    

            </div>
        </div>

    </>);

};

export default AuctionSchedule;
