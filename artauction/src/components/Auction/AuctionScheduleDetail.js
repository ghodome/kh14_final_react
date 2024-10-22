import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/ko";  //moment 한국어 정보 불러오기
moment.locale("ko");  //moment에 한국어를 기본 언어로 설정


const AuctionScheduleDetail = ()=>{
     //parameter
    const {auctionScheduleNo} = useParams();

     //navigator
    const navigate = useNavigate();

     //state
    const [auctionSchedule, setAuctionSchedule] = useState({});

    const [target, setTarget] = useState({    //수정
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

    const changeTarget = useCallback(e=>{
        setTarget({
            ...target,
            [e.target.name] : e.target.value
        });
    }, [target]);

    // target 청소
    const clearTarget = useCallback(e=>{
        setTarget({
            auctionScheduleNo : "",
            auctionScheduleTitle : "",
            auctionScheduleStartDate : "",
            auctionScheduleEndDate : "",
            auctionScheduleState : "",
            auctionScheduleNotice : "",
        })
    }, [target])

    const saveTarget = useCallback(async ()=>{
        await axios.put("http://localhost:8080/auctionSchedule/");
        loadAuctionSchedule();
        closeChangeModal();
    }, [target]);

    //삭제
    const deleteAuctionSchedule = useCallback(async (target)=>{
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if(choice === false) return;

        await axios.delete("http://localhost:8080/auctionSchedule/"+auctionScheduleNo);
        navigate("/auctionschedule");
    }, [auctionSchedule]);

    //수정모달
    const editModal = useRef();

    const openEditModal = useCallback((auctionSchedule)=>{
        const tag = Modal.getOrCreateInstance(editModal.current);
        tag.show();

        setTarget({...auctionSchedule});
    }, [editModal]);

    const closeEditModal = useCallback(()=>{
        const tag = Modal.getInstance(editModal.current);
        tag.hide();
        clearTarget();  //수정입력창 정리
    }, [editModal]);


    
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
                    {moment(auctionSchedule.auctionScheduleStartDate).format("yyyy/MM/DD (dd)Ta hh:mm")}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    종료일
                </div>
                <div className="col-sm-9">
                {moment(auctionSchedule.auctionScheduleEndDate).format("yyyy/MM/DD (dd)Ta hh:mm")}
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
                                onClick={openEditModal}>수정하기</button>
                    <button className="btn btn-danger ms-2" 
                                onClick={deleteAuctionSchedule}>삭제하기</button>
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
                                    {/* 경매 일정 등록 */}
                                    <div className="row mt-4">
                                        <div className="col">
                                            <label>경매 일정명</label>
                                            <input type="text" className="form-control mb-4" 
                                                    name="auctionScheduleTitle" value={target.auctionScheduleTitle} 
                                                    onChange={changeTarget}/>
                                            
                                            <label>일정 시작일</label>
                                            <input type="datetime-local" className="form-control mb-4" 
                                                    name="auctionScheduleStartDate" value={target.auctionScheduleStartDate} 
                                                    onChange={changeTarget}/>

                                            <label>일정 종료일</label>
                                            <input type="datetime-local" className="form-control mb-4" 
                                                    name="auctionScheduleEndDate" value={target.auctionScheduleEndDate} 
                                                    onChange={changeTarget}/>
                                            
                                            <label>일정 상태</label>
                                            <select className="form-select mb-4" name="auctionScheduleState" 
                                                    value={target.auctionScheduleState} onChange={changeTarget}>
                                                <option value="">선택하세요</option>
                                                <option>예정경매</option>
                                                <option>진행경매</option>
                                                <option>종료경매</option>
                                            </select>

                                            <label>안내사항</label>
                                            <textarea type="text" className="form-control mb-4" 
                                                    name="auctionScheduleNotice" value={target.auctionScheduleNotice} 
                                                    onChange={changeTarget}/>

                                            <label>이미지 첨부</label>
                                            {/* <input type="file" id="input" multiple /> */}
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary btn-manual-close" 
                                                onClick={closeEditModal}>취소</button>
                                <button type="button" className="btn btn-success"
                                                onClick={saveTarget}>등록</button>
                                   
                                </div>
                            </div>
                        </div>
                    </div>
    
    </>)

};

export default AuctionScheduleDetail;