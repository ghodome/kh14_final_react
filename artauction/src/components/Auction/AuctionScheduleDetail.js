import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import moment from "moment";
import "moment/locale/ko";  //moment 한국어 정보 불러오기
import { Modal } from "bootstrap";
moment.locale("ko");  //moment에 한국어를 기본 언어로 설정


const AuctionScheduleDetail = ()=>{
    
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
    const saveTarget = useCallback(async ()=>{
        const formData = new FormData();
        const fileList = inputFileRef.current.files;
        
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

        formData.append("originList", target.attachment);

        await axios.post("http://localhost:8080/auctionSchedule/edit", formData,
        { 
            headers:  { 
                "Content-Type": "multipart/form-data",
            },
        });
        
        setImages(loadImages);
      
        clearTarget();
        loadAuctionSchedule();
        closeEditModal();
        setImages([]);
    }, [target]);

    //일정삭제
    const deleteAuctionSchedule = useCallback(async ()=>{
        const choice = window.confirm("정말 삭제하시겠습니까?");
        if(choice === false) return;
        
        await axios.delete("http://localhost:8080/auctionSchedule/"+auctionScheduleNo);
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
            `http://localhost:8080/attach/download/${auctionSchedule.attachment}`
        ]);
    }, [editModal]);
        
    const closeEditModal = useCallback(()=>{
        const tag = Modal.getInstance(editModal.current);
        tag.hide();
        clearTarget(); 
    }, [editModal]);

    
    //출품작 목록
    const loadAuctionList=useCallback(async ()=>{   //출품작 불러오기
        const resp=await axios.get(`http://localhost:8080/auction/${auctionScheduleNo}`);
        console.log(resp.data.auctionList);
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
        const resp=await axios.post(`http://localhost:8080/auction/`, presentInput);
        console.log(presentInput.auctionLot===null)
        if(resp.status===200) 
            window.alert("출품작 등록 완료");
        clearPresentInput();
        closePresentModal();
        loadAuctionList();
    } catch (error) {
        alert("누락된 항목 발생. 전체 항목을 입력해주세요");
    }
    },[presentInput])


    //출품 데이터 서버로 전송
    // const savePresentInput=useCallback(async ()=>{
    //     const resp = await axios.post("http://localhost:8080/auction/", presentInput, {
    //         headers:  { 
    //             "Content-Type": "multipart/form-data",
    //         },
    //     });
    //     // console.log(presentInput.auctionLot===null)
    //     if(resp.status===200) 
    //         window.alert("등록이완료되었습니다.");
        
    //     clearPresentInput();
    //     closePresentModal();
    //     loadAuctionList();
    // },[]);


    //출품작 삭제
    const deleteLot=useCallback(async (auction)=>{
        if(window.confirm("출품 작품을 삭제하시겠습니까?")){
            const resp=await axios.delete("http://localhost:8080/auction/"+auction.auctionNo)
            if(resp.status===200)
            window.alert(`LOT : ${auction.auctionLot}, ${auction.workTitle}이(가) 삭제되었습니다`);
            loadAuctionList();
        }
    },[auctionList]);

    //출품 취소
    const cancelLot=useCallback(async (auction)=>{
        if(window.confirm("출품을 취소하시겠습니까?")){
            const resp=await axios.get("http://localhost:8080/auction/cancelPresent/"+auction.auctionNo);
            if(resp.status===200)
                window.alert(`LOT : ${auction.auctionLot}, ${auction.workTitle}의 출품이 취소되었습니다`);
            clearPresentInput();
            loadAuctionList();
        }
    },[auctionList]);

    //출품 재등록
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
        <Jumbotron title={auctionSchedule.auctionScheduleTitle} content={auctionScheduleNo + " 번 경매 일정 상세정보"}/>

        <div className="container w-50">  
            {/* 경매일정 이미지 */}
            <div className="row mt-4 text-center">
                <div className="col my-4">
                        <img src={`http://localhost:8080/attach/download/${auctionSchedule.attachment}`} 
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
                                    onClick={e=>navigate("/auctionschedule")}>뒤로가기</button>
                </div>
            </div>

            {/* 관리자 기능 */}
            <div className="row mt-2">    
                <div className="col text-end">
                    <button className="btn btn-primary ms-2 rounded-1" 
                                    onClick={openPresentModal}>출품등록</button>
                    <button className="btn btn-outline-dark ms-2 rounded-1"
                                    onClick={e=>navigate("/auctionList/"+auctionScheduleNo)}>경매보기</button>
                    <button className="btn btn-warning ms-2 rounded-1" 
                                onClick={e=>openEditModal(auctionSchedule)}>일정수정</button>
                    <button className="btn btn-danger ms-2 rounded-1" 
                                onClick={e=>deleteAuctionSchedule(auctionSchedule)}>일정삭제</button>
                </div>
            </div>

        </div>

        {/* 관리자 기능 */}
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

                                <label>사진 첨부</label><br/>
                                    <input type="file" className="form-control" name="attachList" multiple accept="image/*"
                                           onChange={changeTarget} ref={inputFileRef} />
                                    {images.map((image, index) => (
                                        <img key={index} src={image} alt={`미리보기 ${index + 1}`} style={{ maxWidth: '100px', margin: '5px' }} />
                                    ))}

                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-success rounded-1"
                                    onClick={saveTarget}>수정</button>
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
                                        <button type="button" className="btn btn-outline-dark card-text ms-2 rounded-1" 
                                                    onClick={e=>navigate(`/auction/detail/${auction.auctionNo}`)}>입찰상세</button>
                                        <button type="button" className="btn btn-warning card-text ms-2 rounded-1" onClick={e => cancelLot(auction)}>취소</button>
                                        <button type="button" className="btn btn-danger card-text ms-2 rounded-1" onClick={e => deleteLot(auction)}>삭제</button>
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