import { useCallback, useRef, useState } from 'react';
import Jumbotron from '../Jumbotron';
import { useEffect } from 'react';
import axios from 'axios';
import { Modal } from "bootstrap";

const AuctionSchedule = ()=>{
    // state
    const [auctionScheduleList, setAuctionScheduleList] = useState([]);

    // 등록 state
    const [insert, setInsert] = useState({
        auctionScheduleTitle : "",
        auctionScheduleStartDate : "",
        auctionScheduleEndDate : "",
        auctionScheduleState : ""
    });

    // 수정 state
    const [edit, setEdit] = useState({
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
            auctionScheduleState : ""
        });
    }, [insert]);

    const editInput = useCallback(e=>{
        setEdit({
            ...edit,
            [e.target.name] : e.target.value
        })
    }, [edit]);

    const saveEditInput = useCallback(async ()=>{
        const resp = await axios.put("http://localhost:8080/auctionSchedule/");
        setAuctionScheduleList(resp.data);
        closeEditModal();
    }, [edit]);

    const clearEditInput = useCallback(e=>{
        setEdit({
            auctionScheduleNo : "",
            auctionScheduleTitle : "",
            auctionScheduleStartDate : "",
            auctionScheduleEndDate : "",
            auctionScheduleState : ""
        });
    }, [edit]);

    // 입력 수정 모달
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

    const editModal = useRef();

    const openEditModal = useCallback((auctionSchedule)=>{
        const tag = Modal.getOrCreateInstance(editModal.current);
        tag.show();
        setEdit({...auctionSchedule});
    }, [editModal]);

    const closeEditModal = useCallback(()=>{
        const tag = Modal.getInstance(editModal.current);
        tag.hide();
        clearEditInput();
    }, [editModal]);



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
                                <h3>{auctionSchedule.auctionScheduleTitle}</h3>
                                <div className="d-flex flex-row">
                                    <div className="p-2">경매시작일</div>
                                    <div className="p-2">{auctionSchedule.auctionScheduleStartDate}</div>
                                </div>
                                <div className="d-flex flex-row">
                                    <div className="p-2">경매종료일</div>
                                    <div className="p-2">{auctionSchedule.auctionScheduleEndDate}</div>
                                </div>
                                <button className="btn btn-outline-secondary mt-2 col-3"
                                            >상세보기</button>
                                <button className="btn btn-outline-secondary mt-2 col-3"
                                            onClick={e=>openEditModal(auctionSchedule.auctionScheduleNo)}>수정하기</button>
                            </div>

                            <div className="col-3 p-4">
                                <p>이미지</p>
                            </div>

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
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary btn-manual-close" 
                                                onClick={closeInsertModal}>취소</button>
                                <button type="button" className="btn btn-success"
                                                onClick={saveInsertInput}>저장</button>
                             
                                        {/* <button type="button" className="btn btn-warning"
                                        onClick={updateBook}><FaEdit />수정</button> */}
                                   
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 경매 일정 수정 모달 */}
                    <div className="modal fade" tabIndex="-1"
                                ref={editModal} data-bs-backdrop="static">
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        경매 일정 수정
                                    </h5>
                                    <button type="button" className="btn-close" 
                                        data-bs-dismiss="modal" aria-label="Close"
                                        onClick={closeEditModal}>
                                    <span aria-hidden="true"></span>
                                    </button>
                                </div>

                                <div className="modal-body">
                                    {/* 경매 일정 수정 */}
                                    <div className="row mt-4">
                                        <div className="col">
                                            <label>경매 일정명</label>
                                            <input type="text" className="form-control mb-4" 
                                                    name="auctionScheduleTitle" value={edit.auctionScheduleTitle} 
                                                    onChange={editInput}/>
                                            
                                            <label>일정 시작일</label>
                                            <input type="datetime-local" className="form-control mb-4" 
                                                    name="auctionScheduleStartDate" value={edit.auctionScheduleStartDate} 
                                                    onChange={editInput}/>

                                            <label>일정 종료일</label>
                                            <input type="datetime-local" className="form-control mb-4" 
                                                    name="auctionScheduleEndDate" value={edit.auctionScheduleEndDate} 
                                                    onChange={editInput}/>
                                            
                                            <label>일정 상태</label>
                                            <select className="form-select mb-4" name="auctionScheduleState" 
                                                    value={edit.auctionScheduleState} onChange={editInput}>
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
                                                onClick={closeEditModal}>취소</button>
                                <button type="button" className="btn btn-success"
                                                onClick={saveEditInput}>저장</button>
                             
                                        {/* <button type="button" className="btn btn-warning"
                                        onClick={updateBook}><FaEdit />수정</button> */}
                                   
                                </div>
                            </div>
                        </div>
                    </div>

                    

            </div>
        </div>

    </>);

};

