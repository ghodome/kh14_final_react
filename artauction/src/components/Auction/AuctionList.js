
import Jumbotron from './../Jumbotron';
const AuctionList = ()=>{

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
                                    <button className="btn btn-outline-primary">경매등록</button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 경매 일정 목록 */}
                    <div className="row">
                        <div className="col-9 p-4 d-flex flex-column position-static">
                            <h3>테스트 경매 1</h3>
                            <div className="d-flex flex-row">
                                <div className="p-2">오픈일</div>
                                <div className="p-2">2024-10-31 10:00 KST</div>
                            </div>
                            <div className="d-flex flex-row">
                                <div className="p-2">경매일</div>
                                <div className="p-2">2024-11-07 14:00 KST</div>
                            </div>
                            <button className="btn btn-outline-secondary mt-2 col-3">상세보기</button>
                        </div>

                        <div className="col-3 p-4">
                            <p>이미지</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-9 p-4 d-flex flex-column position-static">
                            <h3>테스트 경매 2</h3>
                            <div className="d-flex flex-row">
                                <div className="p-2">오픈일</div>
                                <div className="p-2">2024-10-31 10:00 KST</div>
                            </div>
                            <div className="d-flex flex-row">
                                <div className="p-2">경매일</div>
                                <div className="p-2">2024-11-07 14:00 KST</div>
                            </div>
                            <button className="btn btn-outline-secondary mt-2 col-3">상세보기</button>
                        </div>

                        <div className="col-3 p-4">
                            <p>이미지</p>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-9 p-4 d-flex flex-column position-static">
                            <h3>테스트 경매 3</h3>
                            <div className="d-flex flex-row">
                                <div className="p-2">오픈일</div>
                                <div className="p-2">2024-10-31 10:00 KST</div>
                            </div>
                            <div className="d-flex flex-row">
                                <div className="p-2">경매일</div>
                                <div className="p-2">2024-11-07 14:00 KST</div>
                            </div>
                            <button className="btn btn-outline-secondary mt-2 col-3">상세보기</button>
                        </div>

                        <div className="col-3 p-4">
                            <p>이미지</p>
                        </div>
                    </div>


            </div>
        </div>

    </>);

};

export default AuctionList;
