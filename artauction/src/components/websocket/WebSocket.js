import { useCallback, useEffect, useState } from 'react';
import Jumbotron from './../Jumbotron';
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import moment from "moment";
import "moment/locale/ko";
import { useRecoilValue } from 'recoil';
import axios from "axios";
import { loginState, memberIdState, memberRankState } from '../../utils/recoil';

moment.locale("ko");

const WebSocket = () => {
    // state
    const [input, setInput] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [client, setClient] = useState(null);
    const [connect, setConnect] = useState(false);

    // recoil - 아이디 불러오기
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberRank = useRecoilValue(memberRankState);

    // token - 토큰 불러오기
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken") || window.sessionStorage.getItem("refreshToken");

    // effect
    useEffect(() => {
        connectToServer();
        return () => {
            disconnectFromServer(client);
        };
    }, [login]);

    // callback
    const connectToServer = useCallback(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe("/public/chat", (message) => {
                    const json = JSON.parse(message.body);
                    setMessageList(prev => [...prev, json]); 
                });
                setConnect(true);
            },
            onDisconnect: () => {
                setConnect(false);
            },
            debug: (str) => {
                console.log("[DEBUG] " + str);
            }
        });

        if (login === true) {
            client.connectHeaders = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        }

        client.activate();
        setClient(client);
    }, [client, login, accessToken, refreshToken]);


    const disconnectFromServer = useCallback(() => {
        if (client) {
            client.deactivate();
        }
    }, [client]);

    const sendMessage = useCallback(() => {
        if (client === null || connect === false || input.length === 0) return;

        const json = { content: input, sender: memberId };

        const message = {
            destination: "/app/chat",
            body: JSON.stringify(json)
        };

        if (login === true) {
            message.headers = {
                accessToken: accessToken,
                refreshToken: refreshToken
            };
        }

        client.publish(message);
        setInput("");
    }, [input, client, connect, login, accessToken, refreshToken, memberId]);

    // view
    return (
        <>
            <Jumbotron title="웹소켓 클라이언트"
                content={"현재 연결 상태 = " + (connect ? "연결됨" : "종료됨")} />
            <div className="row mt-4">
                <div className='col'>
                    <div className='input-group'>
                        <input type="text" className="form-control"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={login === false}
                        />
                        <button className="btn btn-success"
                            disabled={login === false}
                            onClick={sendMessage}>
                            보내기
                        </button>
                    </div>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group">
                        {messageList.map((message, index) => (
                            <li className="list-group-item" key={index}>
                                <div className={`row ${memberId === message.sender ? 'justify-content-end' : ''}`}>
                                    <div className={`col-5 ${memberId === message.sender ? '' : 'offset-0'}`}>
                                        <h3>
                                            {message.sender}
                                            <small>
                                                ({message.level})
                                            </small>
                                        </h3>
                                        <p>{message.content}</p>
                                        <p className='text-muted'>{moment(message.time).format("a h:mm")}
                                            ({moment(message.time).fromNow()})
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default WebSocket;
