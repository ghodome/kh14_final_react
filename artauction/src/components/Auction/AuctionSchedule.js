import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'bootstrap';
import moment from 'moment';
import 'moment/locale/ko';
import Jumbotron from '../Jumbotron';
import { useRecoilValue } from 'recoil';
import { memberRankState } from '../../utils/recoil';
moment.locale('ko');


const AuctionSchedule = () => {
    const memberRank=useRecoilValue(memberRankState);
    //navigator 
    const navigate = useNavigate(); 

    //state
    const [auctionScheduleList, setAuctionScheduleList] = useState([]); 
    const [allAuctionScheduleList, setAllAuctionScheduleList] = useState([]); 
    const [filterAuctionScheduleList, setfilterAuctionScheduleList] = useState([]); 
    const [auctionState, setAuctionState] = useState('');
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(1);
    const [row, setRow] = useState({
        beginRow: (page - 1) * 10 + 1, 
        endRow: page * 10 
    });

    const [insert, setInsert] = useState({  //등록
        auctionScheduleTitle: '',
        auctionScheduleStartDate: '',
        auctionScheduleEndDate: '',
        auctionScheduleState: '',
        auctionScheduleNotice: '',
        attachment: '',
        attachList: []
    });

    useEffect(() => {
        loadAuctionScheduleList();
    }, [page]); 

    // 경매 일정 목록 불러오기
    const loadAuctionScheduleList = useCallback(async () => {
        try {
            const resp = await axios.post("http://localhost:8080/auctionSchedule/", {
                beginRow: Number(row.beginRow),
                endRow: Number(row.endRow)
            });
            const list = resp.data.auctionScheduleList;
            setAuctionScheduleList(list);
            setAllAuctionScheduleList(list);
            filterSchedule(list, auctionState);
        } catch (error) {
            console.error("Error loading auction schedule list:", error);
        }
    }, [row, auctionState]);
    
    const filterSchedule = (schedule, state) => {
        const filtered = state ? schedule.filter(e => 
            e.auctionScheduleState === state) : schedule;
        setfilterAuctionScheduleList(Array.isArray(filtered) ? filtered : []);
    };

    useEffect(()=>{
        filterSchedule(allAuctionScheduleList, auctionState);
    }, [auctionState, allAuctionScheduleList]);

    useEffect(() => {
        setRow({ 
            beginRow: (page - 1) * 10 + 1, 
            endRow: page * 10 
        });
    }, [page]);

    const handlePagination = (pageNumber)=>{
        setPage(pageNumber); 
    };

    // 경매 일정 등록 모달
    const insertModal = useRef();

    const openInsertModal = useCallback(()=>{
        const tag = Modal.getOrCreateInstance(insertModal.current);
        tag.show();
    }, [insertModal]);

    const closeInsertModal = useCallback(()=>{
        const tag = Modal.getInstance(insertModal.current);
        tag.hide();
        clearInsert();
        setImages([]);
    }, [insertModal]);

    // 입력 폼 초기화
    const clearInsert = useCallback(()=>{
        setInsert({
            auctionScheduleTitle: '',
            auctionScheduleStartDate: '',
            auctionScheduleEndDate: '',
            auctionScheduleState: '',
            auctionScheduleNotice: '',
            attachList: [],
        });
    }, []);

    //등록 내용 작성
    const insertInput = useCallback(async (e) => {
        if (e.target.type === "file") {
            const files = Array.from(e.target.files);
            setInsert({ 
                ...insert, 
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
            setInsert({ 
                ...insert, 
                [e.target.name]: e.target.value 
            });
        }
    }, [insert]);

    const inputFileRef = useRef(null);

    // 등록 버튼 클릭 시 서버로 데이터 전송
    const saveInsertInput = useCallback(async () => {
        try {
            const formData = new FormData();
            const fileList = inputFileRef.current?.files || [];
    
            // 파일 첨부
            if (fileList.length > 0) {
                for (let i = 0; i < fileList.length; i++) {
                    formData.append("attachList", fileList[i]);
                }
            }
    
            // 다른 필드 추가
            formData.append("auctionScheduleTitle", insert.auctionScheduleTitle || '');
            formData.append("auctionScheduleStartDate", insert.auctionScheduleStartDate || '');
            formData.append("auctionScheduleEndDate", insert.auctionScheduleEndDate || '');
            formData.append("auctionScheduleState", insert.auctionScheduleState || '');
            formData.append("auctionScheduleNotice", insert.auctionScheduleNotice || '');
    
            console.log('FormData entries:', Array.from(formData.entries()));
    
            // 서버로 요청 전송
            const resp = await axios.post("http://localhost:8080/auctionSchedule/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            // 성공 시 초기화
            clearInsert();
            closeInsertModal();
            loadAuctionScheduleList();
            setImages([]);
            alert("경매일정 등록 완료");
        } catch (error) {
            alert("누락된 항목 발생. 전체 항목을 입력해주세요");
        }
    }, [insert, loadAuctionScheduleList]);

    // 입력검사


    return (<>
                
            <div className="row mt-4">
                <div className="col">
                    <div className="d-flex flex-row mt-2 mb-2">
                        <button className="btn btn-outline-secondary me-2 rounded-1"
                            onClick={e=>{setAuctionState(""); setPage(1);}}>전체일정</button>
                        <button className="btn btn-outline-secondary me-2 rounded-1"
                            onClick={e=>{setAuctionState("진행경매"); setPage(1);}}>진행경매</button>
                        <button className="btn btn-outline-secondary me-2 rounded-1" 
                            onClick={e=>{setAuctionState("예정경매"); setPage(1);}}>예정경매</button>
                        <button className="btn btn-outline-secondary me-2 rounded-1" 
                            onClick={e=>{setAuctionState("종료경매"); setPage(1);}}>종료경매</button>

                        {/* 관리자 기능 */}
                        {memberRank==='관리자'&&<button className="btn btn-primary ms-auto rounded-1"
                                onClick={openInsertModal}>경매등록
                        </button>}
                    </div>

                    {/* 경매 일정 목록 */}
                    {filterAuctionScheduleList.length > 0 ? (
                        filterAuctionScheduleList.slice(row.beginRow - 1, row.endRow).map((schedule) => (
                        <div className="row" key={schedule.auctionScheduleNo}>
                            <div className="col-9 p-4 d-flex flex-column position-static">
                                <div className="d-flex flex-row mb-2">
                                {schedule.auctionScheduleState === '진행경매' &&(
                                    <div className="badge text-bg-dark text-wrap rounded-1">{schedule.auctionScheduleState}</div>
                                )}
                                {schedule.auctionScheduleState === '예정경매' &&(
                                    <div className="badge text-bg-secondary text-wrap rounded-1">{schedule.auctionScheduleState}</div>
                                )}
                                {schedule.auctionScheduleState === '종료경매' &&(
                                    <div className="badge text-bg-light text-wrap rounded-1">{schedule.auctionScheduleState}</div>
                                )}
                                </div>
                                <div className="d-flex flex-row">
                                    <h3>{schedule.auctionScheduleTitle}</h3>
                                </div>
                                <div className="d-flex flex-row">
                                    <div className="p-2">경매시작일</div>
                                    <div className="p-2">
                                        {moment(schedule.auctionScheduleStartDate).format("yyyy/MM/DD (dd) a hh:mm")}</div>
                                </div>
                                <div className="d-flex flex-row">
                                    <div className="p-2">경매종료일</div>
                                    <div className="p-2">
                                        {moment(schedule.auctionScheduleEndDate).format("yyyy/MM/DD (dd) a hh:mm")}
                                    </div>
                                </div> 

                                <div className="d-flex flex-row mt-2 mb-2">
                                <button className="btn btn-outline-secondary mt-2 col-3 rounded-1"
                                        onClick={e=>navigate("/auctionschedule/detail/"+schedule.auctionScheduleNo)}>경매상세</button>
                                {schedule.auctionScheduleState === '진행경매' &&(
                                    <button className="btn btn-outline-dark mt-2 col-3 ms-3 rounded-1"
                                        onClick={e=>navigate("/auctionList/"+schedule.auctionScheduleNo)}>경매참여</button>
                                )}
                                </div>
                                     
                            </div>
                            
                            {schedule.attachment === null ? (
                                <div className="col-3 p-4">
                                    <img src="https://placehold.co/300x200"
                                            className="img-thumbnail rounded-1" alt=""/>
                                </div>
                            ) : (
                                <div className="col-3 p-4">
                                    <img src={`http://localhost:8080/attach/download/${schedule.attachment}`} 
                                            className="img-thumbnail rounded-1" alt="이미지 정보 없음"/>
                                </div>
                            )}

                            <hr />
                        
                        </div>
                        ))
                    ) : (
                        <div>경매 일정이 없습니다.</div>
                    )}
                    
                    <div className="row">
                        <div className="col text-center">
                            <div className="d-flex justify-content-center">
                                {Array.from({ length: Math.ceil(filterAuctionScheduleList.length / 10) }, (_, i) => (
                                    <button key={i + 1} className={`btn ${page === i + 1 ? 'btn-secondary' : 'btn-outline-secondary'} me-2 rounded-1`} 
                                        onClick={e=>handlePagination(i + 1)}>{i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 경매 일정 등록 모달 */}
                    <div className="modal fade" ref={insertModal} tabIndex="-1" data-bs-backdrop="static">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">경매 일정 등록</h5>
                                    <button type="button" className="btn-close" onClick={closeInsertModal}></button>
                                </div>
                                <div className="modal-body">
                                    <label className="mt-4">일정명</label>
                                    <input type="text" className="form-control mb-3" placeholder="경매 일정명"
                                           name="auctionScheduleTitle" value={insert.auctionScheduleTitle}
                                           onChange={insertInput} />

                                    <label className="mt-2">시작일</label>
                                    <input type="datetime-local" className="form-control mb-3"
                                           name="auctionScheduleStartDate" value={insert.auctionScheduleStartDate}
                                           onChange={insertInput} />

                                    <label className="mt-2">종료일</label>
                                    <input type="datetime-local" className="form-control mb-3"
                                           name="auctionScheduleEndDate" value={insert.auctionScheduleEndDate}
                                           onChange={insertInput} />

                                    <label className="mt-2">일정상태</label>
                                    <select className="form-select mb-3" name="auctionScheduleState"
                                            value={insert.auctionScheduleState}
                                            onChange={insertInput}>
                                        <option value="">선택하세요</option>
                                        <option>예정경매</option>
                                        <option>진행경매</option>
                                        <option>종료경매</option>
                                    </select>

                                    <label className="mt-2">안내사항</label>
                                    <textarea className="form-control mb-3" placeholder="내용을 입력하세요.."
                                              name="auctionScheduleNotice" value={insert.auctionScheduleNotice}
                                              onChange={insertInput}></textarea>
                                    
                                    <label className="mt-2">사진첨부</label>
                                    <input type="file" className="form-control" name="attachList" multiple accept="image/*"
                                           onChange={insertInput} ref={inputFileRef}/>
                                    {images.map((image, index) => (
                                        <img key={index} src={image} alt={`미리보기 ${index + 1}`} style={{ maxWidth: '100px', margin: '5px' }} />
                                    ))}
                                </div>
                                <div className="modal-footer">
                                    {memberRank==='관리자'&&<button type="button" className="btn btn-secondary rounded-1" onClick={closeInsertModal}>취소</button>}
                                    {memberRank==='관리자'&&<button type="button" className="btn btn-success rounded-1" onClick={saveInsertInput}>등록</button>}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );

};

export default AuctionSchedule;