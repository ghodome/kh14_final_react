import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useParams } from "react-router-dom";
import { loginState, memberIdState, memberRankState } from "../../utils/recoil";
import { useRecoilValue } from "recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import moment from "moment";

const Auction = () => {

    //params
    const { auctionNo } = useParams();
    // state
    const [auctionAndWork, setAuctionAndWork] = useState({}); // 초기값을 null로 설정
    const [client, setClient] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [connect, setConnect] = useState(false);
    const [input, setInput]=useState();

    //recoil
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberRank = useRecoilValue(memberRankState);

    //token
    const accessToken=axios.defaults.headers.common["Authorization"];
    const refreshToken=window.localStorage.getItem("refreshToken1")||window.sessionStorage.getItem("refreshToken1");

    //callback
    const loadAuctionAndWork=useCallback(async ()=>{
        const resp = await axios.get(`http://localhost:8080/auction/work/${auctionNo}`);
        setAuctionAndWork(resp.data);
    },[auctionAndWork]);

    const connectToServer= useCallback(()=>{
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory : ()=> socket,
            onConnect : ()=>{
                client.subscribe("/auction/everyone",(message)=>{
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
            debug:(str)=>{
                console.log("[DEBUG] : "+str);
            }
        });
        if(login  === true){
            client.connectHeaders={
                accessToken:accessToken,
                refreshToken:refreshToken,
            };
        }
        client.activate();
        setClient(client);
    },[client,login,accessToken,refreshToken])
    const disconnectToServer=useCallback(()=>{
        if(client){
            client.deactivate();
        }
    },[client]);

    const sendMessage=useCallback(()=>{
        const json={
            content:input
        }
        const message={
            destination:"/auction/everyone",
            body:JSON.stringify(json),
        }
        if(client===null||connect===false||input.length===0||input.startsWith("/")){
            setInput("");
            return;
        }
        else{
            client.publish(message);
            setInput("");
        }
    },[input,client,connect])



    //effect
    useEffect(() => {
        loadAuctionAndWork();
    }, []); 

    // view
    return (
        <>
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
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>최저 추정가</th>
                                        <th>최고 추정가</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            {auctionAndWork.auctionLowPrice}원
                                        </td>
                                        <td>
                                            {auctionAndWork.auctionHighPrice}원
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="row mt-3">
                                <div className="col-md-10 affset-md-1">
                                    <div className=" input-group">
                                        <input type="text" className="form-control"
                                            value={input} onChange={e=>setInput(e.target.value)} disabled={!login}></input>
                                        <button type="button" className="btn btn-success"
                                            onClick={sendMessage} disabled={!login}>보내기</button>
                                    </div>
                                </div>
                            </div>
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
                </>
            ) : (
                <h1>로딩 중...</h1>
            )}
        </>
    );
}

export default Auction;
