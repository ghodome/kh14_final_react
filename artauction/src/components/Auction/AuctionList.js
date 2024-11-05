import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import "moment/locale/ko";  //moment 한국어 정보 불러오기
moment.locale("ko");  //moment에 한국어를 기본 언어로 설정

const AuctionList = ()=>{
    const {auctionScheduleNo} = useParams();
    
    const [auctionDataCollectionList, setAuctionDataCollectionList] = useState([]);
    const [auctionScheduleInfo, setAuctionScheduleInfo] = useState({});

    const [row, setRow] = useState({});
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(()=>{
        loadAuctionScheduleInfo();
        loadAuctionDataCollectionList();
    },[auctionScheduleNo]);

    const loadAuctionDataCollectionList = useCallback(async()=>{
        try{
        const resp = await axios.get(`http://localhost:8080/auction/auctionLotList/${auctionScheduleNo}`);
        // console.log("resp=", resp.data);
        setAuctionDataCollectionList(resp.data);
        } 
        catch (error) {
            console.error("Failed to load auction data:", error);
        }
    },[auctionScheduleNo]);

    const loadAuctionScheduleInfo = useCallback(async()=>{
        try{
            const resp = await axios.get(`http://localhost:8080/auction/auctionScheduleInfo/${auctionScheduleNo}`);
            // console.log("resp=", resp.data);
            setAuctionScheduleInfo(resp.data[0]);
            } 
            catch (error) {
                console.error("Failed to load auction data:", error);
            }
    },[auctionScheduleNo]);

    useEffect(() => {
        setRow({ 
            beginRow: (page - 1) * 10 + 1, 
            endRow: page * 10 });
    }, [page]);
    
    const handlePagination = (pageNumber)=>{
        setPage(pageNumber); 
    };

    const detail = useCallback((target)=>{
        navigate(`/auction/detail/${target}`); 
    },[navigate])

    const paginatedData = auctionDataCollectionList.slice((page - 1) * 10, page * 10);
    
    
    return (<>
        <Jumbotron title={auctionScheduleInfo.auctionScheduleTitle}
                    content={`옥션 스케쥴 넘버 : ${auctionScheduleNo}`}/>


        <div className="row">
            <div className="col">

                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 mt-4">
                {paginatedData.map((auctionData) => (
                <div className={`col mb-3 ${auctionData.auctionState === '출품취소' ? 'opacity-50' : ''}`} 
                    onClick={auctionData.auctionState === '출품취소' ? null : (e) => detail(auctionData.auctionNo)}
                    key={auctionData.auctionNo}>
                        <div className="card h-100 d-flex flex-column">
                            <h4 className="m-2">LOT {auctionData.auctionLot}</h4>
                        <div className="card-header" 
                                style={{ height: '200px', overflow: 'hidden' }}>
                            {auctionData.attachment === null ? (
                               
                                     <img src="https://placehold.co/300x200"
                                            className="card-img-top" alt="" 
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }}/>
                            ) : (
                                    <img src={`http://localhost:8080/attach/download/${auctionData.attachment}`} 
                                        className="card-img-top" alt="이미지 정보 없음" 
                                        style={{ height: '100%', width: '100%', objectFit: 'cover' }}/>
                            )}
                        </div>
                        
                        <div className="card-body flex-grow-1">
                            <h5 className="card-title">{auctionData.artistName}</h5>
                            <h6 className="card-subtitle text-muted">{auctionData.workTitle}</h6>
                            <div className="card-text text-muted mt-3">{auctionData.workSize}</div>
                            <div className="card-text text-muted">{auctionData.workCategory}</div>
                            <hr/>
                            <div className="card-text text-muted">추정가</div>
                            <div className="card-text text-muted text-end">KRW {auctionData.auctionLowPrice}원</div>
                            <div className="card-text text-muted text-end">~ {auctionData.auctionHighPrice}원</div>
                            <div className="card-text text-muted">마감일</div>
                            <div className="text-sm text-muted text-end">
                                {moment(auctionData.auctionEndDate).format("YY-MM-DD a hh:mm")}
                            </div>
                        </div>
                        <div className="card-body text-end">
                            <div className="card-text text-muted">{auctionData.auctionState}</div>
                        </div>
                        </div>
                        </div>
                ))}
                </div>

                <div className="row">
                        <div className="col text-center">
                            <div className="d-flex justify-content-center">
                                {Array.from({ length: Math.ceil(auctionDataCollectionList.length / 10) }, (_, i) => (
                                    <button key={i + 1} className={`btn ${page === i + 1 ? 'btn-secondary' : 'btn-outline-secondary'} me-2`} 
                                        onClick={e=>handlePagination(i + 1)}>{i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

            </div>
        </div>
    </>);
};
export default AuctionList;