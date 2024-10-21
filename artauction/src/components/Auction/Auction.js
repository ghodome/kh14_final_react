import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useParams } from "react-router-dom";

const Auction = () => {
    // state
    const { auctionNo } = useParams();
    const [auction, setAuction] = useState(null); // 초기값을 null로 설정

    const loadAuction = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:8080/auction/detail/${auctionNo}`);
            setAuction(resp.data); // API 응답 데이터 설정
        } catch (error) {
            console.error("Error loading auction:", error); // 오류 처리
        }
    }, [auctionNo]); 

    useEffect(() => {
        loadAuction();
    }, []); 

    // view
    return (
        <>
            {auction ? ( // auction이 null이 아닐 때만 렌더링
                <>
                    <Jumbotron title="경매 상세 페이지" />
                    <div className="row mt-4">
                        <div className="col-8">
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                            사진<br/>
                        </div>
                        <div className="col-4">
                            <h2>{auction.auctionNo}번</h2>
                            <div className="row mt-2">
                                <div className="col-6">
                                    일정번호 : {auction.auctionScheduleNo}
                                </div>
                                <div className="col-6">
                                    작품번호 : {auction.workNo}
                                </div>
                            </div>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>예상 최저가</th>
                                        <th>예상 최고가</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {auction.auctionLowPrice.toLocaleString()}원
                                        </td>
                                        <td>
                                            {auction.auctionHighPrice.toLocaleString()}원
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <h4>{auction.auctionState}</h4>
                        </div>
                       <hr/>
                   </div>
                </>
            ) : (
                <h1>로딩 중...</h1>
            )}
        </>
    );
}

export default Auction;
