import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { loginState, memberIdState, memberRankState } from "../../utils/recoil";
import { useRecoilValue } from "recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import moment from "moment";
import styles from './auction.module.css';
import { GiPayMoney } from "react-icons/gi";
import { TbZoomMoney } from "react-icons/tb";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Modal } from "bootstrap";

const Auction = () => {
    //ref
    const bidModal=useRef();
    const loading = useRef(false);
    //params
    const { auctionNo } = useParams();
    //navigate
    const navigate = useNavigate();
    // state
    const [auctionAndWork, setAuctionAndWork] = useState({
        auctionStartPrice:0,
        auctionBidIncrement:0,
    });
    const [client, setClient] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [connect, setConnect] = useState(false);
    const [bidIncrement,setBidIncrement]=useState();
    const [input, setInput]=useState({
        type:"bid",
        bid:{
            workName:"",
            auctionLot:"",
            bidPrice:"",
            bidIncrement:"",
        }
    });

    const [wholeMessageList, setWholeMessageList]=useState([]);

    //recoil
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberRank = useRecoilValue(memberRankState);

    //token
    const accessToken=axios.defaults.headers.common["Authorization"];
    const refreshToken=window.localStorage.getItem("refreshToken1")||window.sessionStorage.getItem("refreshToken1");

    //callback
    const clearInput=(()=>{
        setInput({
            type:"bid",
            bid:{
                auctionLot:"",
                bidPrice:"",
                bidIncrement:"",
            }
        });
    },[])
    const loadAuctionAndWork=useCallback(async ()=>{
        const resp = await axios.get(`http://localhost:8080/auction/work/${auctionNo}`);
        setAuctionAndWork(resp.data);
        setBidIncrementByPrice(resp.data.auctionBidPrice>0?resp.data.auctionBidPrice:resp.data.auctionStartPrice);
        if(resp){
            setInput({
                type:"bid",
                bid:{
                    workName:auctionAndWork.workTitle,
                    auctionLot:auctionAndWork.auctionLot,
                    bidPrice:auctionAndWork.auctionBidPrice>0?auctionAndWork.auctionBidPrice:auctionAndWork.auctionStartPrice,
                    bidIncrement:bidIncrement,
                },
            });
        }
    },[auctionNo,bidIncrement]);

    const setBidIncrementByPrice = useCallback((price) => {
        let increment;
        switch (true) {
            case ( price < 1000000):
                increment = 50000;
                break;
            case (price >= 1000000 && price < 3000000):
                increment = 100000;
                break;
            case (price >= 3000000 && price < 5000000):
                increment = 200000;
                break;
            case (price >= 5000000 && price < 10000000):
                increment = 500000;
                break;
            case (price >= 10000000 && price < 30000000):
                increment = 1000000;
                break;
            case (price >= 30000000 && price < 50000000):
                increment = 2000000;
                break;
            case (price >= 50000000 && price < 200000000):
                increment = 5000000;
                break;
            default:
                increment = 10000000;
        }
        setBidIncrement(increment); 
    },[bidIncrement]);

    const connectToServer= useCallback(()=>{
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory : ()=> socket,
            onConnect : ()=>{
                client.subscribe("/auction/progress",(message)=>{
                    const json = JSON.parse(message.body);
                    setMessageList(prev=>[...prev,json]);
                });
                if(login){
                    client.subscribe(`/auction/${auctionNo}`,(message)=>{
                        const json = JSON.parse(message.body);
                        setMessageList(prev=>[...prev,json]);
                    });
                }
                setConnect(true);
            },
            onDisconnect:()=>{
                setConnect(false);
            },
            // debug:(str)=>{
                // console.log("[DEBUG] : "+str);
            // }
        });
        if(login  === true){
            client.connectHeaders={
                accessToken:accessToken,
                refreshToken:refreshToken,
            };
        }
        client.activate();
        setClient(client);
    },[client,login,accessToken,refreshToken]);

    const disconnectToServer=useCallback(()=>{
        if(client){
            client.deactivate();
        }
    },[client]);

    const sendMessage = useCallback(async () => {
        const json = { content: input };
    
        if (client === null || !connect) {
            loadAuctionAndWork();
            return;
        } else {
            const bidResp = await axios.patch(`http://localhost:8080/auctionchat/${auctionNo}`, json.content);
            
            if (bidResp.data.success) {
                window.alert(`LOT ${json.content.bid.auctionLot} ${json.content.bid.bidPrice + json.content.bid.bidIncrement}원 응찰에 성공하셨습니다.`);
            } else {
                window.alert(`동일 가격 차순위 응찰되었습니다.`);
            }
        }
        
        // 응찰 성공 후 새 bidPrice 업데이트를 위해 loadAuctionAndWork 호출
        loadAuctionAndWork();
    }, [input, client, connect, auctionAndWork]);

    const increaseBidIncrement=useCallback(()=>{
        setInput({
            ...input,
            bid:{...input.bid,
                bidIncrement:input.bid.bidIncrement+bidIncrement}
        })
    },[bidIncrement])

    const decreaseBidIncrement = useCallback(()=>{
        setInput({
            ...input,
            bid:{...input.bid,
                bidIncrement:input.bid.bidIncrement>bidIncrement?
                input.bid.bidIncrement-bidIncrement:input.bid.bidIncrement}
        })
    },[bidIncrement]);

    const loadMessageList=useCallback(async ()=>{
        const resp=await axios.get(`http://localhost:8080/bid/bidMessageList/${auctionNo}`);
        setWholeMessageList(resp.data);
    },[wholeMessageList]);

    const openBidIncrementModal = useCallback(() => {
        const tag = Modal.getOrCreateInstance(bidModal.current);
        tag.show();
    },[bidModal]);
    const closeBidIncrementModal = useCallback(() => {
        const tag = Modal.getInstance(bidModal.current);
        tag.hide();
    },[bidModal]);

    //effect
    useEffect(()=>{
        loadAuctionAndWork();
        connectToServer();
        loadMessageList();
        return () => {
            disconnectToServer(client);
        };
    },[])
    useEffect(() => {
        if (auctionAndWork) {
            setInput((prev) => ({
                ...prev,
                bid: {
                    ...prev.bid,
                    workName: auctionAndWork.workTitle,
                    auctionLot: auctionAndWork.auctionLot,
                    bidPrice: auctionAndWork.auctionBidPrice > 0 ? auctionAndWork.auctionBidPrice : auctionAndWork.auctionStartPrice,
                    bidIncrement: bidIncrement,
                },
            }));
        }
    }, [auctionAndWork,bidIncrement]);
    
    // view
    return (
        <>
            <div className={styles.auctionContainer}>
            <div className="mt-5 text-center">
                {auctionAndWork&&(<h4>{auctionAndWork.auctionScheduleNo}주차 경매 현황</h4>)}
                <ul className="list-group">
                    {messageList.slice(-5).map((message, index) => (
                        <div className="row" key={index}>
                            <div className="col">
                                <p>{message.content.contentForSchedule}</p>
                                <p className="text-muted">
                                    {(message.content.bidtime)}
                                </p>
                            </div>
                        </div>
                    ))}
                </ul>
            </div>
            {auctionAndWork? ( 
                <>
                    <div className="row mt-4">
                        <div className="col-7">
                            {/* 작품 상세내용  */}
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.workTitle}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.workDescription}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.workMaterials}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.workSize}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.workCategory}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.workTitle}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.artistName}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.artistDescription}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.artistMaterials}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {auctionAndWork.artistBirth} ~  {auctionAndWork.artistDeath}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                   
                                </div>
                            </div>
                        </div>
                        <div className="col-5">
                            <h2>LOT {auctionAndWork.auctionLot}</h2>
                            <div className="row mt-2">
                                <div className="col-6">
                                    일정번호 : {auctionAndWork.auctionScheduleNo}
                                </div>
                                <div className="col-6">
                                    작품번호 : {auctionAndWork.workNo}
                                </div>
                            </div>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                            <th>경매 진행 상황</th>
                                            <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="row">
                                                <div className="col-4">추정가</div>
                                                <div className="col-8">{auctionAndWork.auctionLowPrice}원</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="row">
                                                <div className="col-4">~</div>
                                                <div className="col-8">{auctionAndWork.auctionHighPrice}원</div>
                                            </div>
                                        </td>
                                    </tr>
                                        <tr>
                                            <td>
                                                <div className="row">
                                                    <div className="col-4">시작가</div>
                                                    <div className="col-8">{auctionAndWork.auctionStartPrice}원</div>
                                                </div>
                                            </td>
                                        </tr>
                                        {input.bid.bidPrice>0&&(
                                        <tr>
                                            <td>
                                                <div className="row">
                                                    <div className="col-4">현재가</div>
                                                    <div className="col-5">{input.bid.bidPrice}원</div>
                                                    <div className="col-3">{auctionAndWork.auctionBidCnt}회</div>
                                                </div>
                                            </td>
                                        </tr>
                                        )}
                                        <tr>
                                            <td>
                                                <div className="row">
                                                    <div className="col-4">호가 단위</div>
                                                    <div className="col-5">{bidIncrement}원</div>
                                                    <div className="col-3">
                                                        <div onClick={e=>openBidIncrementModal()}>
                                                        <IoMdInformationCircleOutline /></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="row">
                                                    <div className="col-4">마감 시간</div>
                                                    <div className="col-5">{moment(auctionAndWork.auctionEndDate).format('yyyy-MM-DD H:mm:ss')}</div>
                                                    <div className="col-3">
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                </tbody>
                            </table>
                            {login?(
                            <div className="row mt-3">
                                <div className="col-md-10 affset-md-1">
                                    <div className=" input-group w-100">
                                        <button type="button" className="btn btn-success"
                                            onClick={increaseBidIncrement}><GiPayMoney /></button>
                                        <button type="button" className="btn btn-danger"
                                            onClick={decreaseBidIncrement}><GiPayMoney /></button>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            value={input.bid.bidPrice!==0?input.bid.bidPrice+input.bid.bidIncrement
                                                :auctionAndWork.auctionStartPrice+auctionAndWork.auctionBidIncrement
                                            } 
                                            onChange={e=>setInput(prev=>({
                                                ...prev,
                                                bid:{...prev.content,
                                                        bidPrice:e.target.value>0?e.target.value:0,
                                                }
                                            }))}
                                            
                                                placeholder="응찰 가격을 입력하세요"></input>
                                        <button type="button" className="btn btn-success"
                                            onClick={sendMessage}><TbZoomMoney /></button>
                                    </div>
                                </div>
                            </div>
                            ):(
                                <div className="row mt-3">
                                    <div className="col-md-10 affset-md-1">
                                        <button type="button" className="btn btn-primary"
                                        onClick={e=>navigate("/login")}>로그인 후 응찰이 가능합니다.</button>
                                    </div>
                                </div>
                            )}
                            <ul className="list-group">
                                {messageList && messageList.slice().reverse().map((message, index) => (
                                    <div className="row" key={index}>
                                        <div className="col">
                                            <p>{message.content.contentForLot}</p>
                                            <p className="text-muted">
                                                {moment(message.content.bidTime).format('HH:mm:ss:SSS')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </ul>
                                {wholeMessageList && wholeMessageList.slice().reverse().map((message, index) => (
                                    <div className="row" key={index}>
                                        <div className="col">
                                            <p>{message.content.contentForLot}</p>
                                            <p className="text-muted">
                                                {moment(message.time).format('HH:mm:ss:SSS')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                       <hr/>
                   </div>
                   <div className="modal fade" ref={bidModal}>
                            <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">호가 단위 안내</h5>
                                    <button
                                        type="button" 
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={closeBidIncrementModal}>
                                    </button>
                                </div>
                                    <div className="modal-body">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>현재가</th>
                                                    <th>호가 단위</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td>300,000~999,999원</td><td>50,000원</td></tr>
                                                <tr><td>1,000,000~2,999,999원</td><td>100,000원</td></tr>
                                                <tr><td>3,000,000~4,999,999원</td><td>200,000원</td></tr>
                                                <tr><td>5,000,000~9,999,999원</td><td>500,000원</td></tr>
                                                <tr><td>10,000,000~29,999,999원</td><td>1,000,000원</td></tr>
                                                <tr><td>30,000,000~49,999,999원</td><td>2,000,000원</td></tr>
                                                <tr><td>50,000,000~199,999,999원</td><td>5,000,000원</td></tr>
                                                <tr><td>200,000,000~499,999,999원</td><td>10,000,000원</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                </>
            ) : (
                <h1>로딩 중...</h1>
            )}
            </div>
           
        </>
    );
}

export default Auction;
