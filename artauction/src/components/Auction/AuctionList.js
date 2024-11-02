import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const AuctionList = ()=>{
    const {auctionScheduleNo} = useParams();
    
    const [auctionDataCollectionList, setAuctionDataCollectionList] = useState([]);
    const [row, setRow] = useState({});
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    useEffect(()=>{
        loadAuctionDataCollectionList();
    },[]);

    const loadAuctionDataCollectionList = useCallback(async()=>{
        const resp = await axios.get(`http://localhost:8080/auction/auctionList/${auctionScheduleNo}`, row)
        console.log(resp.data);
        setAuctionDataCollectionList(resp.data);
    },[row]);

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
    },[])
    
    
    return (<>
        <Jumbotron title={`옥션 스케쥴 넘버 : ${auctionScheduleNo}`} />


        <div className="row">
            <div className="col-md-10 offset-md-1">

                <div className="row row-cols-1 row-cols-sm-3 row-cols-lg-5">
                {auctionDataCollectionList && auctionDataCollectionList.map((auctionData, index)=>(
                    <div className="row mt-4" key={auctionData}>
                        
                        <div className="card h-100 d-flex flex-column">
                            <h4>LOT {auctionData.auctionLot}</h4>
                        <div className="card-header" 
                                style={{ height: '150px', overflow: 'hidden' }}
                                onClick={e=>detail(auctionData.auctionNo)}>
                            {auctionData.attachment === null ? (
                                <div className="card-img-top">
                                     <img src="https://placehold.co/300x200"
                                            className="img-thumbnail" alt="" 
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }}/>
                                </div>
                            ) : (
                                <div className="card-img-top">
                                    <img src={`http://localhost:8080/attach/download/${auctionData.attachment}`} 
                                        className="img" alt="이미지 정보 없음" 
                                        style={{ height: '100%', width: '100%', objectFit: 'cover' }}/>
                                </div>
                            )}
                        </div>
                        
                        <div className="card-body flex-grow-1">
                            <h5 className="card-title">{auctionData.artistName}</h5>
                            <h6 className="card-subtitle text-muted">작품명 {auctionData.workTitle}</h6>
                            <div className="card-text text-muted mt-3">작품 크기 {auctionData.workSize}</div>
                            <div className="card-text text-muted">작품 분류 {auctionData.workCategory}</div>
                            <hr/>
                            <div className="card-text text-muted">예상최저가 : {auctionData.auctionLowPrice}원</div>
                            <div className="card-text text-muted">예상최고가 : {auctionData.auctionHighPrice}원</div>
                            <div className="card-text text-muted">마감일 : {auctionData.auctionEndDate}</div>
                        </div>
                        <div className="card-body text-end">
                            <div className="card-text text-muted">{auctionData.auctionState}</div>
                        </div>
                        </div>
                    </div>
                ))}
                </div> 
            </div>
        </div>
    </>);
};
export default AuctionList;