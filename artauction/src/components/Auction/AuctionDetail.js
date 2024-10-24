import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useParams } from "react-router-dom";
import { loginState, memberIdState, memberRankState } from "../../utils/recoil";
import { useRecoilValue } from "recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const Auction = () => {

    //params
    const { auctionNo } = useParams();
    // state
    const [auctionAndWork, setAuctionAndWork] = useState({}); // 초기값을 null로 설정
    const [client, setClient] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [connect, setConnect] = useState(false);

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
                client.subscribe(`/auction/${auctionNo}`,(message)=>{
                    const json = JSON.parse(message.body);
                    setMessageList(prev=>[...prev,json]);
                });
                setConnect(true);
            },
            onDisconnect:()=>{
                setConnect(false);
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
    },[client])


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

                            <h4>{auctionAndWork.auctionState}</h4>
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
