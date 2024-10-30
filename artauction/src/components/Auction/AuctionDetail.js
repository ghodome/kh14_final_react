import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
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
import { MdOutlineQuestionMark } from "react-icons/md";
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
        auctionHammerPrice:null,
        auctionStartPrice:0,
        auctionBidIncrement:0,
    });
    const [client, setClient] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [connect, setConnect] = useState(false);
    const [bidIncrement,setBidIncrement]=useState();
    const [input, setInput]=useState({
        type:"",
        bid:{
            hammerPrice:"",
            bidPrice:"",
            bidIncrement:"",
        }
    });

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
            type:"",
            bid:{
                hammerPrice:"",
                bidPrice:"",
                bidIncrement:"",
            }
        });
    },[input])
    const loadAuctionAndWork=useCallback(async ()=>{
        const resp = await axios.get(`http://localhost:8080/auction/work/${auctionNo}`);
        setAuctionAndWork(resp.data);
        setBidIncrementByPrice(resp.data.auctionBidPrice>0?resp.data.auctionBidPrice:resp.data.auctionStartPrice);
        if(resp){
            setInput({
                type:"bid",
                bid:{
                    hammerPrice:auctionAndWork.auctionHammerPrice!==null?auctionAndWork.auctionHammerPrice:auctionAndWork.auctionStartPrice,
                    bidPrice:auctionAndWork.auctionBidPrice>0?auctionAndWork.auctionBidPrice:auctionAndWork.auctionStartPrice,
                    bidIncrement:bidIncrement,
                },
            });
        }
    },[auctionAndWork,input,auctionNo,bidIncrement]);

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
            case (price >= 200000000 && price < 500000000):
                increment = 10000000;
                break;
            default:
                increment = 50000; // 기준에 맞지 않는 경우 기본값 설정
        }
        setBidIncrement(increment); // 설정한 호가 단위를 업데이트
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

    const sendMessage=useCallback(async ()=>{
        const json={
            content:input
        }
        const message={
            destination:"/auctionws/message/"+auctionNo,
            body:JSON.stringify(json),
        }
        if(client===null||connect===false||input.bid.bidPrice===0){
            setInput("");
            return;
        }
        else{
            const bidResp=await axios.post("http://localhost:8080/auctionws/"+auctionNo,json.content);

            if(bidResp.data.success){
                client.publish(message);
                setInput({...input,
                    bid:{...input.bid,
                        bidPrice:bidResp.data.content.bidPrice,
                        bidIncrement:bidResp.data.content.bidIncrement,
                    }
                });
            }
            else{
                window.alert("실패 : "+bidResp.data.message);
            }
        }
    },[input,client,connect]);

    const increaseBidIncrement=useCallback(()=>{
        setInput({
            ...input,
            bid:{...input.bid,
                bidIncrement:input.bid.bidIncrement+bidIncrement}
        })
    },[input,bidIncrement])

    const decreaseBidIncrement = useCallback(()=>{
        setInput({
            ...input,
            bid:{...input.bid,
                bidIncrement:input.bid.bidIncrement>bidIncrement?
                input.bid.bidIncrement-bidIncrement:input.bid.bidIncrement}
        })
    },[input,bidIncrement]);


    //effect
    useEffect(() => {
        loadAuctionAndWork();
        connectToServer();
        return () => {
            disconnectToServer(client);
        };
    }, [login]); 
    const openBidIncrementModal = useCallback(() => {
        console.log(bidModal.current);
        const tag = Modal.getOrCreateInstance(bidModal.current);
        tag.show();
    },[bidModal]);
    const closeBidIncrementModal = useCallback(() => {
        const tag = Modal.getInstance(bidModal.current);
        tag.hide();
    },[bidModal]);

    // view
    return (
        <>
            <div className={styles.auctionContainer}>
            {auctionAndWork ? ( // auction이 null이 아닐 때만 렌더링
                <>
                    <Jumbotron title={`${auctionAndWork.auctionScheduleNo} 주차 경매`} />
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
                                                <div className="col-5">최저 추정가</div>
                                                <div className="col-7">{auctionAndWork.auctionLowPrice}원</div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div className="row">
                                                <div className="col-5">최대 추정가</div>
                                                <div className="col-7">{auctionAndWork.auctionHighPrice}원</div>
                                            </div>
                                        </td>
                                    </tr>
                                        <tr>
                                            <td>
                                                <div className="row">
                                                    <div className="col-5">시작가</div>
                                                    <div className="col-7">{auctionAndWork.auctionStartPrice}원</div>
                                                </div>
                                            </td>
                                        </tr>
                                        {input.bid.bidPrice>0&&(
                                        <tr>
                                            <td>
                                                <div className="row">
                                                    <div className="col-5">현재가</div>
                                                    <div className="col-7">{input.bid.bidPrice}원</div>
                                                </div>
                                            </td>
                                        </tr>
                                        )}
                                        <tr>
                                            <td>
                                                <div className="row">
                                                    <div className="col-5">현재 호가 단위</div>
                                                    <div className="col-4">{bidIncrement}원</div>
                                                    <div className="col-3">
                                                        <button type="button" 
                                                        className="btn btn-default" 
                                                        onClick={e=>openBidIncrementModal()}>
                                                            <MdOutlineQuestionMark /></button>
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
                                            onClick={increaseBidIncrement} disabled={!login||!input.bid.bidPrice}><GiPayMoney /></button>
                                        <button type="button" className="btn btn-danger"
                                            onClick={decreaseBidIncrement} disabled={!login||!input.bid.bidPrice}><GiPayMoney /></button>
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
                                            }))} disabled={!login}
                                                placeholder="응찰 가격을 입력하세요"></input>
                                        <button type="button" className="btn btn-success"
                                            onClick={sendMessage} disabled={!login||!input.bid.bidPrice}><TbZoomMoney /></button>
                                    </div>
                                </div>
                            </div>
                            ):(
                                <div className="row mt-3">
                                    <div className="col-md-10 affset-md-1">
                                    {loading === true &&(
                                            <button type="button" className="btn btn-primary"
                                            onClick={e=>navigate("/login")}>로그인 후 응찰이 가능합니다</button>
                                        )}
                                    </div>
                                </div>
                            )}
                            <ul className="list-group">
                                {messageList&&messageList.map((message,index)=>(
                                    <div className="row" key={index}>
                                        <div className="col">
                                            <p>{message.senderMemberId}:{message.content.content}</p>
                                            <p className="text-muted">
                                                {moment(message.content.bidtime).format("a h:mm")}
                                                ({moment(message.content.bidtime).fromNow()})
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </ul>
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
