import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/ko";  //moment 한국어 정보 불러오기
import { Modal } from "bootstrap";
moment.locale("ko");  //moment에 한국어를 기본 언어로 설정


const AuctionScheduleDetail = ()=>{
    //ref
    const presentModal=useRef();
     //parameter
     const {auctionScheduleNo} = useParams();

     //navigator
     const navigate = useNavigate();

     //state
     const [auctionSchedule, setAuctionSchedule] = useState({});

     const [images, setImages] = useState([]); // 이미지 미리보기 URL 목록

     const [target, setTarget] = useState({    //수정
        auctionScheduleNo : "",
        auctionScheduleTitle : "",
        auctionScheduleStartDate : "",
        auctionScheduleEndDate : "",
        auctionScheduleState : "",
        auctionScheduleNotice : "",
        attachList: []
    });

    const [presentInput, setPresentInput]= useState({
        auctionScheduleNo: auctionScheduleNo,
        auctionStartDate:"",
        auctionEndDate:"",
        workNo: "",
        auctionLot: "",
        auctionStartPrice: "",
        auctionLowPrice: "",
        auctionHighPrice: "",
        auctionConsigner: "",
        auctionConsignmentFee: "",
        auctionNetProceeds: "",
    });

    const [auctionList, setAuctionList] =useState([]);

    //effect
    useEffect(()=>{
        loadAuctionSchedule();
        loadAuctionList();
    }, []);

    //callback
    const loadAuctionSchedule = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/auctionSchedule/"+auctionScheduleNo);
        setAuctionSchedule({
            ...resp.data,
            auctionScheduleStartDate:new Date(resp.data.auctionScheduleStartDate).toISOString().slice(0,16),
            auctionScheduleEndDate:new Date(resp.data.auctionScheduleEndDate).toISOString().slice(0,16)
        })
        setPresentInput({
            ...presentInput,
            auctionStartDate:new Date(resp.data.auctionScheduleStartDate).toISOString().slice(0,16),
            auctionEndDate:new Date(resp.data.auctionScheduleEndDate).toISOString().slice(0,16),
        });
    }, [auctionSchedule,presentInput]);


    //수정
    // const changeTarget = useCallback(e=>{
    //     setTarget({
    //         ...target,
    //         [e.target.name] : e.target.value
    //     });
    // }, [target]);

    //수정내용 작성
    const changeTarget = useCallback(e=>{
        if (e.target.type === "file") {
            const files = Array.from(e.target.files);
            setTarget({ 
                ...target, 
                attachList: files 
            });
            //이미지 미리보기
            const imageUrls = files.map(file => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    return new Promise((resolve) => {
                        reader.onloadend = () => {
                            resolve(reader.result);
                        };
                    });
                })
            Promise.all(imageUrls).then(urls => {
                setImages(urls);
            })
        } 
        else {
            setTarget({ 
                ...target, 
                [e.target.name]: e.target.value 
            });
        }
    }, [target]);

    const clearTarget = useCallback(e=>{
        setTarget({
            auctionScheduleNo : "",
            auctionScheduleTitle : "",
            auctionScheduleStartDate : "",
            auctionScheduleEndDate : "",
            auctionScheduleState : "",
            auctionScheduleNotice : "",
            attachList: []
        })
    }, [target])

    const changePresentInput=useCallback((e)=>{
        setPresentInput({
            ...presentInput,
            [e.target.name]:e.target.value
        })
    },[presentInput])

    const editAuctionSchedule = useCallback(async ()=>{
        await axios.put("http://localhost:8080/auctionSchedule/", target);
        changeTarget();
        loadAuctionSchedule();
    }, [auctionSchedule, target]);

    const saveTarget = useCallback(async ()=>{
        const resp = await axios.put("http://localhost:8080/auctionSchedule/", target);
        loadAuctionSchedule(resp.data);
        closeEditModal();
    }, [target]);

    //삭제
    const deleteAuctionSchedule = useCallback(async ()=>{
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
        setTarget({
            ...auctionSchedule
        });
    }, [editModal]);

    const closeEditModal = useCallback(()=>{
        const tag = Modal.getInstance(editModal.current);
        tag.hide();
        clearTarget(); 
    }, [editModal]);

    //출품작 등록
    const registPresentInput=useCallback(async ()=>{
        const resp=await axios.post(`http://localhost:8080/auction/`,presentInput);
        console.log(presentInput.auctionLot===null)
        if(resp.status===200) 
            window.alert("등록이완료되었습니다.");
        closePresentModal();
        loadAuctionList();
        clearPresentModal();
    },[presentInput])

    const openPresentModal=useCallback(()=>{
        if(presentModal.current){
            const tag = Modal.getOrCreateInstance(presentModal.current);
            tag.show();
        }
    },[presentModal])

    const closePresentModal=useCallback(()=>{
        if(presentModal.current){
        const tag = Modal.getInstance(presentModal.current);
        tag.hide();
    }
        
    },[presentModal,registPresentInput]);

    const clearPresentModal = useCallback(() => {
        setPresentInput((prev) => ({
            ...prev,
            auctionScheduleNo: auctionScheduleNo, 
            workNo: '',
            auctionStartPrice: '',
            auctionLowPrice: '',
            auctionHighPrice: '',
            auctionState: '',
            auctionConsigner: '',
            auctionConsignmentFee: '',
            auctionNetProceeds: '',
        }));
    }, [auctionScheduleNo]);

    const loadAuctionList=useCallback(async ()=>{
        const resp=await axios.get(`http://localhost:8080/auction/auctionList/${auctionScheduleNo}`);
        setAuctionList(resp.data);
    },[auctionList]);

    const deleteLot=useCallback(async (auction)=>{
        const resp=await axios.delete("http://localhost:8080/auction/"+auction.auctionNo)
        if(resp.status===200)
        window.alert(`LOT : ${auction.auctionLot}, ${auction.workTitle}이(가) 삭제되었습니다`);
        loadAuctionList();
    },[auctionList]);

    const cancelLot=useCallback(async (auction)=>{
        if(window.confirm("출품을 취소하시겠습니까?")){
            const resp=await axios.get("http://localhost:8080/auction/cancelPresent/"+auction.auctionNo);
            if(resp.status===200)
                window.alert(`LOT : ${auction.auctionLot}, ${auction.workTitle}의 출품이 취소되었습니다`);
            clearPresentModal();
            loadAuctionList();
        }
    },[auctionList]);

    const uncancelLot=useCallback(async (auction)=>{
        if(window.confirm("출품 하시겠습니까?")){
            const resp=await axios.get("http://localhost:8080/auction/uncancelPresent/"+auction.auctionNo);
            if(resp.status===200)
                window.alert(`LOT : ${auction.auctionLot}, ${auction.workTitle}의 출품이 등록되었습니다`);
            loadAuctionList();
            
        }
    },[auctionList]);


    //view
    return (<>
        <Jumbotron title={auctionScheduleNo +"번 경매 일정 상세정보"}/>

        <div className="container w-50">  

            <div className="row mt-4 text-center">
                <div className="col my-4">
                        <img src={`http://localhost:8080/attach/download/${auctionSchedule.attachment}`} 
                            className="img-thumbnail" alt="" height='300px' width='500px' />
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
                    {moment(auctionSchedule.auctionScheduleStartDate).format("yyyy/MM/DD (dd) a hh:mm")}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    종료일
                </div>
                <div className="col-sm-9">
                    {moment(auctionSchedule.auctionScheduleEndDate).format("yyyy/MM/DD (dd) a hh:mm")}
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
                <button className="btn btn-success ms-2" 
                                onClick={openPresentModal}>출품 등록</button>
                <button className="btn btn-secondary ms-2" 
                                onClick={e=>navigate("/auctionschedule")}>목록보기</button>
                    <button className="btn btn-warning ms-2" 
                                onClick={e=>openEditModal(auctionSchedule)}>수정하기</button>
                    <button className="btn btn-danger ms-2" 
                                onClick={e=>deleteAuctionSchedule(auctionSchedule)}>삭제하기</button>
            </div>
        </div>
        {/* 출품 목록 (카드) */}
        <div className="row mt-5">
            <div className="col">
                {auctionList.length > 0 && (<h3 className="text-center my-3">출품 목록</h3>)}
                <ul className="row mt-2">
                    {auctionList.map((auction, index) => (
                        auction.auctionState === '출품취소' ? (
                            <div className="col-8 offset-2 col-sm-5 offset-sm-1 col-md-4 offset-md-0 mb-3 opacity-50 bg-secondary}" key={index}>
                                <div className="card">
                                    <div className="card-body text-nowrap">
                                        <h5 className="card-title">LOT {auction.auctionLot}</h5>
                                        <p className="card-text">{auction.workTitle}</p>
                                        <p className="card-text">{auction.workMaterials}</p>
                                        <p className="card-text">{auction.workCategory}</p><button type="button" className="btn btn-danger card-text mx-2" onClick={e => deleteLot(auction)}>삭제</button>
                                        <button type="button" className="btn btn-success card-text mx-2" onClick={e => uncancelLot(auction)}>등록</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="col-8 offset-2 col-sm-5 offset-sm-1 col-md-4 offset-md-0 mb-3" key={index}>
                                <div className="card">
                                    <div className="card-body text-nowrap">
                                        <h5 className="card-title">LOT {auction.auctionLot}</h5>
                                        <p className="card-text">{auction.workTitle}</p>
                                        <p className="card-text">{auction.workMaterials}</p>
                                        <p className="card-text">{auction.workCategory}</p>
                                        <p className="card-text" onClick={e=>navigate(`/auction/detail/${auction.auctionNo}`)}>경매 입장</p>
                                        <button type="button" className="btn btn-danger card-text mx-2" onClick={e => deleteLot(auction)}>삭제</button>
                                        <button type="button" className="btn btn-warning card-text mx-2" onClick={e => cancelLot(auction)}>취소</button>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
                </ul>
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
                        <input type="text" 
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
                        <input type="text" 
                        value={presentInput.auctionLot} 
                        name="auctionLot" 
                        className="form-control" 
                        onChange={e => changePresentInput(e)} 
                        placeholder="출품 번호는 비어있는 Lot가 있을시에만 입력하세요"
                        autoComplete="off"/>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>시작 가격</label>
                        <input type="text" 
                        name="auctionStartPrice" 
                        className="form-control" 
                        value={presentInput.auctionStartPrice} 
                        onChange={e => changePresentInput(e)} 
                        placeholder="숫자만"
                        autoComplete="off"/>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <label>예상 최저가</label>
                        <input type="text" 
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
                        <input type="text" 
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
                        <input type="text" 
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
                        <input type="text" 
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
                                <input type="file" id="input" multiple />

                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary btn-manual-close" 
                                    onClick={closeEditModal}>취소</button>
                        <button type="button" className="btn btn-success"
                                    onClick={saveTarget}>수정</button>
                                    
                    </div>
                </div>
            </div>
        </div>
    
    </>);
};

export default AuctionScheduleDetail;