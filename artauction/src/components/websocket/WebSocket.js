import { useCallback, useEffect, useState } from 'react';
import Jumbotron from '../Jumbotron';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const WebSocketChat = () => {
    // state
    const [input, setInput] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [client, setClient] = useState(null);
    const [connect, setConnect] = useState(false);

    // effect
    useEffect(() => {
        connectToServer();
        return () => {
            disconnectFromServer();
        }
    }, []);

    // callback
    const connectToServer = useCallback(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                setConnect(true);
                stompClient.subscribe("/public/chat", (message) => {
                    setMessageList(prev => [...prev, JSON.parse(message.body)]);
                });
            },
            onDisconnect: () => {
                setConnect(false);
            },
            debug: (str) => {
                console.log(str);
            }
        });
        stompClient.activate();
        setClient(stompClient);
    }, []);

    const disconnectFromServer = useCallback(() => {
        if (client) {
            client.deactivate();
        }
    }, [client]);

    const sendMessage = useCallback(() => {
        if (client === null || !connect || input.length === 0) return;
        client.publish({
            destination: "/art/chat",
            body: JSON.stringify({ content: input }), // 메시지 포맷에 맞게 변환
        });
        setMessageList(prev => [...prev, { content: input }]); // 입력한 메시지를 리스트에 추가
        setInput("");
    }, [input, client, connect]);

    return (
        <>
            <Jumbotron title="웹소켓" content={connect ? "연결됨" : "종료됨"} />
            <div className='row mt-4'>
                <div className='col'>
                    <div className='input-group mb-3'>
                        <input
                            type='text'
                            className='form-control'
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="메시지를 입력하세요"
                            onKeyUp={e=>{if(e.key=='Enter') sendMessage();}}
                        />
                        <button className='btn btn-primary' onClick={sendMessage}>보냄</button>
                    </div>
                    <ul className='message-list'>
                        {messageList.map((message, index) => (
                            <li key={index} className='message'>
                                {message.content}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default WebSocketChat;
