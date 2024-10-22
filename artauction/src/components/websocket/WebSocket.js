import { useCallback, useEffect, useState } from 'react';
import Jumbotron from './../Jumbotron';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import moment from "moment";
import "moment/locale/ko";
moment.locale("ko");
const WebSocket = ()=>{
    //state
    const [input, setInput] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [client, setClient] = useState(null);
    const [connect, setConnect] = useState(false);
    
   
    //effect
    useEffect(()=>{
        connectToServer();
        return ()=>{
            disconnectFromServer();
        }
    }, []);
    //callback
    const connectToServer = useCallback(()=>{
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory : ()=>socket,
            onConnect: ()=>{
                client.subscribe("/public/chat", (message)=>{
                    const json = JSON.parse(message.body);
                    setMessageList(prev=>[...prev, json]);//순서 보장
                });
                setConnect(true);
            },
            onDisconnect: ()=>{
                setConnect(false);
            },
            debug: (str)=>{
                console.log("[DEBUG] " + str);
            }
        });
        client.activate();
        setClient(client);
    }, [client, connect]);
    const disconnectFromServer = useCallback(()=>{
        if(client) {
            client.deactivate();
        }
    }, [client, connect]);

    const sendMessage = useCallback(()=>{
        if(client === null) return;
        if(connect === false) return;
        if(input.length === 0) return;

        const json = {content : input};

        client.publish({
            destination: "/app/chat",
            body: JSON.stringify(json)
        });
        setInput("");
    }, [input, client, connect]);

    //view
    return (<>
        <Jumbotron title="웹소켓 클라이언트" 
                content={"현재 연결 상태 = " + (connect ? "연결됨" : "종료됨")}/>
        <div className="row mt-4">
            <div className='col'>
                <div className='input-group'>
                    <input type="text" className="form-control"
                            value={input} 
                            onChange={e=>setInput(e.target.value)}/>
                    <button className="btn btn-success"
                            onClick={sendMessage}>
                        보내기
                    </button>
                </div>
            </div>
        </div>
        <div className="row mt-4">
            <div className="col">
                <ul className="list-group">
                    {messageList.map((message, index)=>(
                    <li className="list-group-item" key={index}>
                        <p>{message.content}</p>
                        <p className='text-muted'>{moment(message.time).format("a h:mm")}
                            ({moment(message.time).fromNow()})
                        </p>
                    </li>
                    ))}
                </ul>

            </div>
        </div>
    </>);
};
export default WebSocket;