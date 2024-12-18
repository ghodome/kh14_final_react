import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/ko";  //moment 한국어 정보 불러오기
import { Modal } from "bootstrap";
import { memberRankState } from "../../utils/recoil";
import { useRecoilValue } from "recoil";
moment.locale("ko");  //moment에 한국어를 기본 언어로 설정


const AuctionScheduleDetail = ()=>{
    //recoil
    const memberRank=useRecoilValue(memberRankState);
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
        attachment : "",
        attachList: []
    });

    const [presentInput, setPresentInput]= useState({   //출품등록
        auctionScheduleNo: auctionScheduleNo,
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
        const resp = await axios.get("/auctionSchedule/"+auctionScheduleNo);
        // console.log(resp.data);
        setAuctionSchedule({
            ...resp.data,
            // auctionScheduleStartDate:new Date(resp.data.auctionScheduleStartDate).toISOString().slice(0,16),
            // auctionScheduleEndDate:new Date(resp.data.auctionScheduleEndDate).toISOString().slice(0,16)
        })
        setPresentInput({
            ...presentInput,
            auctionStartDate:new Date(resp.data.auctionScheduleStartDate).toISOString().slice(0,16),
            auctionEndDate:new Date(resp.data.auctionScheduleEndDate).toISOString().slice(0,16),
        });
    }, [auctionSchedule,presentInput]);

    const inputFileRef = useRef(null);

    //수정내용 작성
    const changeTarget = useCallback(e=>{
        const { name, value } = e.target;
        if (e.target.type === "file") {
            const files = Array.from(e.target.files);
            setTarget( prevTarget=>({
                ...prevTarget, 
                attachList: files 
            }));
            // 새로 선택한 파일의 미리보기 URL 생성
            const imageUrls = files.map(file=>{
                const reader =new FileReader();
                reader.readAsDataURL(file);
                return new Promise ((resolve) => {
                    reader.onloadend = () =>{
                        resolve(reader.result);
                    };
                });
            });
            Promise.all(imageUrls).then(urls => {
                setAttachImages(urls);
            });
        }
        else{
            setTarget(prevTarget => ({
                ...prevTarget,
                [name] : value
            }));
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
            attachment : "",
            attachList: []
        })
    }, [target])

    const [loadImages, setLoadImages] = useState([]);
    const [attachImages, setAttachImages] = useState([]);//보낼 추가첨부사진이미지

    // 수정내용 저장
    // const saveTarget = useCallback(async ()=>{
    //     const formData = new FormData();
    //     const fileList = inputFileRef.current.files;
        
    //     if (fileList.length > 0) {
    //         for (let i = 0; i < fileList.length; i++) {
    //             formData.append("attachList", fileList[i]);
    //         }
    //     }
        
    //     formData.append("auctionScheduleNo", target.auctionScheduleNo); 
    //     formData.append("auctionScheduleTitle", target.auctionScheduleTitle);
    //     formData.append("auctionScheduleStartDate", target.auctionScheduleStartDate);
    //     formData.append("auctionScheduleEndDate", target.auctionScheduleEndDate);
    //     formData.append("auctionScheduleState", target.auctionScheduleState);
    //     formData.append("auctionScheduleNotice", target.auctionScheduleNotice);

    //     formData.append("originList", target.attachment);

    //     await axios.post("/auctionSchedule/edit", formData,
    //     { 
    //         headers:  { 
    //             "Content-Type": "multipart/form-data",
    //         },
    //     });
        
    //     setImages(loadImages);
      
    //     clearTarget();
    //     loadAuctionSchedule();
    //     closeEditModal();
    //     setImages([]);
    // }, [target]);

    const saveTarget = useCallback(async () => {
        const formData = new FormData();
        const fileList = inputFileRef.current.files;
    
        // 파일이 새로 첨부된 경우만 attachList에 추가
        if (fileList.length > 0) {
            for (let i = 0; i < fileList.length; i++) {
                formData.append("attachList", fileList[i]);
            }
        }
    
        formData.append("auctionScheduleNo", target.auctionScheduleNo); 
        formData.append("auctionScheduleTitle", target.auctionScheduleTitle);
        formData.append("auctionScheduleStartDate", target.auctionScheduleStartDate);
        formData.append("auctionScheduleEndDate", target.auctionScheduleEndDate);
        formData.append("auctionScheduleState", target.auctionScheduleState);
        formData.append("auctionScheduleNotice", target.auctionScheduleNotice);
    
        // 이미지가 새로 첨부되지 않은 경우 기존 attachment를 유지
        const originList = fileList.length > 0 ? loadImages : (target.attachment ? [target.attachment] : []);
        formData.append("originList", originList);
    
        await axios.post("/auctionSchedule/edit", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    
        // 이미지가 새로 첨부되지 않으면 기존 이미지를 유지하거나 빈 배열로 설정
        setImages(fileList.length > 0 ? loadImages : (target.attachment ? [target.attachment] : []));
    
        clearTarget();
        clearEditState();
        setImages([]); // 미리보기 이미지 초기화
        setAttachImages([]); // 추가 첨부 이미지 초기화
        loadAuctionSchedule();
        closeEditModal();
    }, [target, loadImages]);

    //일정삭제
    const deleteAuctionSchedule = useCallback(async ()=>{
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if(choice === false) return;
        
        await axios.delete("/auctionSchedule/"+auctionScheduleNo);
        navigate("/auctionschedule");
    }, [auctionSchedule]);
        
    //일정수정 모달
    const editModal = useRef();
        
    const openEditModal = useCallback((auctionSchedule)=>{
        const tag = Modal.getOrCreateInstance(editModal.current);
        tag.show();

        // 파일 입력 필드 초기화
        if (inputFileRef.current) {
            inputFileRef.current.value = "";
        }

        setTarget({
            ...auctionSchedule, 
        });
        // 기존 첨부파일 이미지 URL 설정
        setImages([
            `${process.env.REACT_APP_BASE_URL}/attach/download/${auctionSchedule.attachment}`
        ]);
    }, [editModal]);
        
    const closeEditModal = useCallback(()=>{
        const tag = Modal.getInstance(editModal.current);
        tag.hide();
        clearTarget(); 
    }, [editModal]);
    
    //출품작 목록
    const loadAuctionList=useCallback(async ()=>{   //출품작 불러오기
        const resp=await axios.get(`/auction/${auctionScheduleNo}`);
        // console.log(resp.data.auctionList);
        setAuctionList([
            ...resp.data
        ]);
    },[auctionList]);
    
    //출품작 등록 모달
    const presentModal=useRef();

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
    },[presentModal]);

    //출품 입력 초기화
    const clearPresentInput = useCallback(() => {
        setPresentInput((prev) => ({
            ...prev,
            auctionScheduleNo: auctionScheduleNo,
            workNo: "",
            auctionLot: "",
            auctionStartPrice: "",
            auctionLowPrice: "",
            auctionHighPrice: "",
            auctionConsigner: "",
            auctionConsignmentFee: "",
            auctionNetProceeds: "",
        }));
    }, [auctionScheduleNo]);

    //출품 내용 작성
    const changePresentInput=useCallback((e)=>{
        setPresentInput({
            ...presentInput,
            [e.target.name] : e.target.value
        })
    },[presentInput])
    
    //출품 등록
    const registPresentInput=useCallback(async ()=>{
        try {
            if(presentInput.auctionStartPrice.substring(presentInput.auctionStartPrice.length-2)!=='00') {
                window.alert("시작가격은 100원 단위여야 합니다.");
                return;
            }
            const resp=await axios.post(`/auction/`, presentInput);
            console.log(presentInput.auctionLot===null)
            if(resp.status===200) 
                window.alert("출품작 등록 완료");
            clearPresentInput();
        closePresentModal();
        loadAuctionList();
    } catch (error) {
        window.alert("누락된 항목 발생. 전체 항목을 입력해주세요");
    }
    },[presentInput])

    //출품작 삭제
    const deleteLot=useCallback(async (auction)=>{
        if(window.confirm("출품 작품을 삭제하시겠습니까?")){
            const resp=await axios.delete("/auction/"+auction.auctionNo)
            if(resp.status===200)
            window.alert(`LOT : ${auction.auctionLot}, ${auction.workTitle}이(가) 삭제되었습니다`);
            loadAuctionList();
        }
    },[auctionList]);

    //출품 취소
    const cancelLot=useCallback(async (auction)=>{
        if(window.confirm("출품을 취소하시겠습니까?")){
            const resp=await axios.get("/auction/cancelPresent/"+auction.auctionNo);
            if(resp.status===200)
                window.alert(`LOT : ${auction.auctionLot}, ${auction.workTitle}의 출품이 취소되었습니다`);
            clearPresentInput();
            loadAuctionList();
        }
    },[auctionList]);

    //출품 재등록
    const uncancelLot=useCallback(async (auction)=>{
        if(window.confirm("출품 하시겠습니까?")){
            const resp=await axios.get("/auction/uncancelPresent/"+auction.auctionNo);
            if(resp.status===200)
                window.alert(`LOT : ${auction.auctionLot}, ${auction.workTitle}의 출품이 등록되었습니다`);
            loadAuctionList();

        }
    },[auctionList]);

    // 일정 수정 입력검사
    const [scheduleEditFileValid, setScheduleEditFileValid] = useState(true);
    const [scheduleEditTitleValid, setScheduleEditTitleValid] = useState(true);
    const [scheduleEditStartDateValid, setScheduleEditStartDateValid] = useState(true);
    const [scheduleEditEndDateValid, setScheduleEditEndDateValid] = useState(true);
    const [scheduleEditStateValid, setScheduleEditStateValid] = useState(true);
    const [scheduleEditNoticeValid, setScheduleEditNoticeValid] = useState(true);

    const [scheduleEditFileClass, setScheduleEditFileClass] = useState("");
    const [scheduleEditTitleClass, setScheduleEditTitleClass] = useState("");
    const [scheduleEditStartDateClass, setScheduleEditStartDateClass] = useState("");
    const [scheduleEditEndDateClass, setScheduleEditEndDateClass] = useState("");
    const [scheduleEditStateClass, setScheduleEditStateClass] = useState("");
    const [scheduleEditNoticeClass, setScheduleEditNoticeClass] = useState("");

    const checkScheduleEditFile = useCallback(()=> {
        const valid = (target.attachList && target.attachList.length > 0);
        setScheduleEditFileValid(valid);
        if (!target.attachList || target.attachList.length === 0) {
            setScheduleEditFileClass("");
        } else {
            setScheduleEditFileClass(valid ? "is-valid" : "is-invalid");
        }
    }, [target]);

    const checkScheduleEditTitle = useCallback(()=>{
        const regex = /^([ㄱ-힣a-zA-Z!@#$%^&*~()_+-=\s]{1,100})$/;
        const valid = regex.test(target.auctionScheduleTitle);
        setScheduleEditTitleValid(valid);
        if(target.auctionScheduleTitle.length === 0) setScheduleEditTitleClass("");
        else setScheduleEditTitleClass(valid ? "is-valid" : "is-invalid");
    }, [target]);

    const checkScheduleEditStartDate = useCallback(()=>{
        const valid = target.auctionScheduleStartDate !== null;
        setScheduleEditStartDateValid(valid);
        if(target.auctionScheduleStartDate.length === 0) setScheduleEditStartDateClass("");
        else setScheduleEditStartDateClass(valid ? "is-valid" : "is-invalid");
    }, [target]);

    const checkScheduleEditEndDate = useCallback(()=>{
        const valid = target.auctionScheduleEndDate !== null;
        setScheduleEditEndDateValid(valid);
        if(target.auctionScheduleEndDate.length === 0) setScheduleEditEndDateClass("");
        else setScheduleEditEndDateClass(valid ? "is-valid" : "is-invalid");
    }, [target]);
    
    const checkScheduleEditState = useCallback(()=>{
        const valid = ["예정경매", "진행경매", "종료경매"].includes(target.auctionScheduleState);
        setScheduleEditStateValid(valid);
        if(target.auctionScheduleState.length === 0) setScheduleEditStateClass("");
        else setScheduleEditStateClass(valid ? "is-valid" : "is-invalid");
    }, [target]);

    const checkScheduleEditNotice = useCallback(()=>{
        const regex = /^([ㄱ-힣a-zA-Z!@#$%^&*~()_+-=\s]{1,300})$/;
        const valid = regex.test(target.auctionScheduleNotice);
        setScheduleEditNoticeValid(valid);
        if(target.auctionScheduleNotice.length === 0) setScheduleEditNoticeClass("");
        else setScheduleEditNoticeClass(valid ? "is-valid" : "is-invalid");
    }, [target]);
    
    const isAllValid = useMemo(()=>{
        return scheduleEditFileValid && scheduleEditTitleValid && scheduleEditStartDateValid 
                && scheduleEditEndDateValid && scheduleEditStateValid && scheduleEditNoticeValid
    }, [scheduleEditFileValid, scheduleEditTitleValid, scheduleEditStartDateValid, 
        scheduleEditEndDateValid, scheduleEditStateValid, scheduleEditNoticeValid]);
    
    const clearEditState = useCallback(()=>{
        setScheduleEditFileValid(true);
        setScheduleEditTitleValid(true);
        setScheduleEditStartDateValid(true);
        setScheduleEditEndDateValid(true);
        setScheduleEditStateValid(true);
        setScheduleEditNoticeValid(true);

        setScheduleEditFileClass("");
        setScheduleEditTitleClass("");
        setScheduleEditStartDateClass("");
        setScheduleEditEndDateClass("");
        setScheduleEditStateClass("");
        setScheduleEditNoticeClass("");
    }, []);

    //view
    return (<>

        <div className="container w-50">  
            {/* 경매일정 이미지 */}
            <div className="row mt-4 text-center">
                <div className="col my-4">
                        <img src={`${process.env.REACT_APP_BASE_URL}/attach/download/${auctionSchedule.attachment}`} 
                                className="img-thumbnail rounded-1" alt="" height='300px' width='500px' />
                </div>
            </div>

            {/* 경매일정 상세정보 */}
            <div className="row mt-4">
                <div className="col">
                    {auctionSchedule.auctionScheduleState === '진행경매' &&(
                        <div className="badge text-bg-dark text-wrap rounded-1">{auctionSchedule.auctionScheduleState}</div>
                    )}
                    {auctionSchedule.auctionScheduleState === '예정경매' &&(
                        <div className="badge text-bg-secondary text-wrap rounded-1">{auctionSchedule.auctionScheduleState}</div>
                    )}
                    {auctionSchedule.auctionScheduleState === '종료경매' &&(
                        <div className="badge text-bg-light text-wrap rounded-1">{auctionSchedule.auctionScheduleState}</div>
                    )}
                    <h3 className="mt-2">{auctionSchedule.auctionScheduleTitle}</h3>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-4">
                    경매오픈
                </div>
                <div className="col-sm-8">
                    {moment(auctionSchedule.auctionScheduleStartDate).format("yyyy/MM/DD (dd) a hh:mm")}
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-sm-4">
                    경매마감
                </div>
                <div className="col-sm-8">
                    {moment(auctionSchedule.auctionScheduleEndDate).format("yyyy/MM/DD (dd) a hh:mm")}
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-sm-4">
                    안내사항
                </div>
                <div className="col-sm-8">
                    {auctionSchedule.auctionScheduleNotice}
                </div>
            </div>

            {/* 각종 버튼들 */}
            <div className="row mt-4">
                <div className="col text-end">
                {auctionSchedule.auctionScheduleState === '진행경매' && (
                    <button className="btn btn-outline-dark ms-2 rounded-1"
                                    onClick={e=>navigate("/auctionList/"+auctionScheduleNo)}>경매참여</button>
                )}
                    <button className="btn btn-outline-secondary ms-2 rounded-1" 
                                    onClick={e=>navigate("/auctionschedule")}>목록가기</button>
                </div>
            </div>

            {/* 관리자 기능 */}
            {memberRank==='관리자'&&<div className="row mt-2">    
                <div className="col text-end">
                <button className="btn btn-primary ms-2 rounded-1" 
                                    onClick={openPresentModal}>출품등록</button>
                    <button className="btn btn-success ms-2 rounded-1"
                                    onClick={e=>navigate("/auctionList/"+auctionScheduleNo)}>경매보기</button>
                    <button className="btn btn-warning ms-2 rounded-1" 
                                onClick={e=>openEditModal(auctionSchedule)}>일정수정</button>
                    <button className="btn btn-danger ms-2 rounded-1" 
                                onClick={e=>deleteAuctionSchedule(auctionSchedule)}>일정삭제</button>
                </div>
            </div>}

        </div>

        {/* 관리자 기능 */}
        {/* 경매 일정 수정 모달 */}
        <div className="modal fade" tabIndex="-1"
                ref={editModal} data-bs-backdrop="static">
            <div className="modal-dialog">
                <div className="modal-content">

                <div className="modal-header">
                        <h5 className="modal-title">경매 일정 수정</h5>
                        <button type="button" className="btn-close" onClick={closeEditModal}></button>
                    </div>

                    <div className="modal-body">
                        <label className="mt-4">일정명</label>
                        <input type="text" className={`form-control mb-3 ${scheduleEditTitleClass}`} 
                            name="auctionScheduleTitle" value={target.auctionScheduleTitle} 
                            onChange={e=>changeTarget(e)} autoComplete="off" 
                            onBlur={checkScheduleEditTitle} onFocus={checkScheduleEditTitle}/>
                        <div className="valid-feedback"></div>
                        <div className="invalid-feedback"></div>
                                        
                        <label className="mt-2">시작일</label>
                        <input type="datetime-local" className={`form-control mb-3 ${scheduleEditStartDateClass}`}
                            name="auctionScheduleStartDate" value={target.auctionScheduleStartDate}
                            onChange={e=>changeTarget(e)} autoComplete="off" 
                            onBlur={checkScheduleEditStartDate} onFocus={checkScheduleEditStartDate}/>
                        <div className="valid-feedback"></div>
                        <div className="invalid-feedback"></div>

                        <label className="mt-2">종료일</label>
                        <input type="datetime-local" className={`form-control mb-3 ${scheduleEditEndDateClass}`}
                            name="auctionScheduleStartDate" value={target.auctionScheduleEndDate}
                            onChange={e=>changeTarget(e)} autoComplete="off" 
                            onBlur={checkScheduleEditEndDate} onFocus={checkScheduleEditEndDate}/>
                        <div className="valid-feedback"></div>
                        <div className="invalid-feedback"></div>
                                            
                        <label className="mt-2">일정상태</label>
                        <select className={`form-select mb-3 ${scheduleEditStateClass}`} 
                            name="auctionScheduleState" value={target.auctionScheduleState}
                            onChange={e=>changeTarget(e)}
                            onBlur={checkScheduleEditState} onFocus={checkScheduleEditState}>
                            <option selected disabled value="">선택하세요</option>
                                <option>예정경매</option>
                                <option>진행경매</option>
                                <option>종료경매</option>
                        </select>
                        <div className="valid-feedback"></div>
                        <div className="invalid-feedback"></div>

                        <label className="mt-2">안내사항</label>
                        <textarea className={`form-control mb-3 ${scheduleEditNoticeClass}`} 
                            name="auctionScheduleNotice" value={target.auctionScheduleNotice}
                            onChange={e=>changeTarget(e)} autoComplete="off" 
                            onBlur={checkScheduleEditNotice} onFocus={checkScheduleEditNotice} />
                        <div className="valid-feedback"></div>
                        <div className="invalid-feedback"></div>

                        <label className="mt-2">사진첨부</label>
                        <input type="file" className={`form-control ${scheduleEditFileClass}`}  
                            name="attachList" multiple accept="image/*"
                            onChange={e=>changeTarget(e)} ref={inputFileRef}
                            onBlur={checkScheduleEditFile} onFocus={checkScheduleEditFile}/>
                        {attachImages.map((image, index) => (
                            <div key={index} style={{ position: "relative", display: "inline-block" }}>
                              <img src={image} alt={`미리보기 ${index + 1}`} style={{ maxWidth: '100px', margin: '5px', display: "block" }} />
                            </div>
                        ))}
                        <div className="valid-feedback"></div>
                        <div className="invalid-feedback"></div>

                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-success rounded-1"
                                    onClick={saveTarget} disabled={isAllValid === false}>수정</button>
                        <button type="button" className="btn btn-secondary btn-manual-close rounded-1" 
                                    onClick={closeEditModal}>취소</button>                   
                    </div>
                    
                </div>
            </div>
        </div>

        {/* 출품 목록 (카드) */}
        <div className="row mt-5">
            <div className="col">
                {auctionList.length > 0 && (<h3 className="text-center my-3">출품 목록</h3>)}
                <ul className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 mt-2">
                    {auctionList.map((auction, index) => (
                        auction.auctionState === '출품취소' ? (
                            <div className="col-8 offset-2 offset-md-0 mb-3 opacity-50 bg-secondary}" key={index}>
                                <div className="card">
                                    <div className="card-body text-nowrap">
                                        <h5 className="card-title">LOT {auction.auctionLot}</h5>
                                        <div className="card-text">{auction.workTitle}</div>
                                        <div className="card-text">{auction.workMaterials}</div>
                                        <div className="card-text">{auction.workCategory}</div>
                                        <div className="text-end">
                                            <button type="button" className="btn btn-primary card-text ms-2 rounded-1" 
                                                    onClick={e => uncancelLot(auction)}>등록</button>
                                            <button type="button" className="btn btn-danger card-text ms-2 rounded-1" 
                                                    onClick={e => deleteLot(auction)}>삭제</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="col-8 offset-2 offset-md-0 mb-3" key={index}>
                                <div className="card">
                                    <div className="card-body text-nowrap">
                                        <h5 className="card-title">LOT {auction.auctionLot}</h5>
                                        <div className="card-text">{auction.workTitle}</div>
                                        <div className="card-text">{auction.workMaterials}</div>
                                        <div className="card-text">{auction.workCategory}</div>
                                        <div className="text-end mt-4">
                                        <div className="row mt-1">
                                            <div className="col">
                                                <button type="button" className="btn btn-outline-dark card-text ms-2 rounded-1" 
                                                    onClick={e=>navigate(`/auction/detail/${auction.auctionNo}`)}
                                                    disabled={auction.auctionState=='종료경매'}>입찰상세</button>
                                            </div>
                                        </div>
                                        <div className="row mt-1">
                                            <div className="col">
                                                {memberRank==='관리자'&&<button type="button" className="btn btn-warning card-text ms-2 rounded-1" onClick={e => cancelLot(auction)}>취소</button>}
                                                {memberRank==='관리자'&&<button type="button" className="btn btn-danger card-text ms-2 rounded-1" onClick={e => deleteLot(auction)}>삭제</button>}
                                            </div>
                                        </div>
                                    </div>
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
                        onChange={changePresentInput} 
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
                        onChange={changePresentInput} 
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
                        onChange={changePresentInput} 
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
                        onChange={changePresentInput} 
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
                        onChange={changePresentInput} 
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
                        onChange={changePresentInput} 
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
                        onChange={changePresentInput} 
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
                        onChange={changePresentInput} 
                        placeholder="숫자만"
                        autoComplete="off"/>
                    </div>
                </div>
                </div>
                <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-success rounded-1"
                    onClick={registPresentInput}>
                    등록
                </button>
                <button
                    type="button"
                    className="btn btn-secondary rounded-1"
                    onClick={closePresentModal}>
                    취소
                </button>
                </div>
            </div>

            </div>
        </div>
    </>);
};

export default AuctionScheduleDetail;