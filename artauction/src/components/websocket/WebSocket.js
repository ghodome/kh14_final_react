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
    const [input, setInput] = useState(""); 
    const [messageList, setMessageList] = useState(() => {
        // 로컬 스토리지에서 이전 메시지 불러오기
        const savedMessages = window.localStorage.getItem('messageList');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [client, setClient] = useState(null); // WebSocket 클라이언트 상태
    const [connect, setConnect] = useState(false); // 연결 상태

    const login = useRecoilValue(loginState); // 로그인 상태
    const memberId = useRecoilValue(memberIdState); // 회원 ID
    const memberRank = useRecoilValue(memberRankState); // 회원 등급

    const accessToken = axios.defaults.headers.common["Authorization"]; // 액세스 토큰
    const refreshToken = window.localStorage.getItem("refreshToken") || window.sessionStorage.getItem("refreshToken"); // 리프레시 토큰

    // 메시지 리스트를 로컬 스토리지에 저장
    useEffect(() => {
        window.localStorage.setItem('messageList', JSON.stringify(messageList));
    }, [messageList]);

    // 서버 연결
    useEffect(() => {
        connectToServer();
        return () => {
            disconnectFromServer(client);
        };
    }, [login]);

    // 채팅방 생성 함수
    const createChatRoom = async () => {
        const response = await axios.post("http://localhost:8080/roomchat/create", {
            memberId: memberId,
        });
        // console.log("채팅방 생성 성공:", response.data);
    };

    // 서버와 연결하는 함수
    const connectToServer = useCallback(() => {
        const socket = new SockJS("http://localhost:8080/ws"); // SockJS를 이용해 소켓 생성
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                // 서버에 연결되면 호출
                client.subscribe("/public/chat", (message) => {
                    const json = JSON.parse(message.body);
                    setMessageList(prev => [...prev, json]); // 새로운 메시지를 리스트에 추가
                });
                setConnect(true);
                createChatRoom(); // 채팅방 생성
            },
            onDisconnect: () => {
                setConnect(false); // 연결 종료
            },
            debug: (str) => {
                console.log("[DEBUG] " + str); // 디버깅 메시지
            }
        });

        // 로그인 상태일 경우 헤더에 토큰 추가
        if (login === true) {
            client.connectHeaders = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        }

        client.activate(); // 클라이언트 활성화
        setClient(client); // 클라이언트 상태 저장
    }, [client, login, accessToken, refreshToken]);

    // 서버와의 연결 종료 함수
    const disconnectFromServer = useCallback(() => {
        if (client) {
            client.deactivate(); 
        }
    }, [client]);

    // 메시지 전송 함수
    const sendMessage = useCallback(() => {
        if (client === null || connect === false || input.length === 0) return;

        const json = { content: input, sender: memberId }; // 전송할 메시지 객체

        const message = {
            destination: "/app/chat", // 메시지 전송 경로
            body: JSON.stringify(json)
        };

        if (login === true) {
            message.headers = {
                accessToken: accessToken,
                refreshToken: refreshToken
            };
        }

        client.publish(message); // 메시지 전송
        setInput(""); 
    }, [input, client, connect, login, accessToken, refreshToken, memberId]);

    // 메시지 리스트 비우기 함수
    const clearMessages = () => {
        setMessageList([]); // 메시지 리스트 초기화
        window.localStorage.removeItem('messageList'); // 로컬 스토리지에서 메시지 삭제
    };

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
                        <button className="btn btn-danger" 
                            disabled={login === false} 
                            onClick={clearMessages}>
                            비우기
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
