import { useLocation, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import moment from "moment";

const RoomChat = () => {
    const { roomNo } = useParams();
    const navigate = useNavigate();

    // state
    const [input, setInput] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [client, setClient] = useState(null);
    const [connect, setConnect] = useState(false);

    // recoil
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLoading = useRecoilValue(memberLoadingState);

    // token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken")
        || window.sessionStorage.getItem("refreshToken");

    // effect: 메시지 불러오기 및 웹소켓 연결
    useEffect(() => {
        // 로컬 스토리지에서 메시지 불러오기
        const savedMessages = localStorage.getItem(`messages_${roomNo}`);
        if (savedMessages) {
            setMessageList(JSON.parse(savedMessages));
        }

        const client = connectToServer();
        setClient(client);
        return () => {
            disconnectFromServer(client);
        };
    }, [roomNo]);

    // callback: 서버 연결
    const connectToServer = useCallback(() => {
        const socket = new SockJS(process.env.REACT_APP_BASE_URL + "/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            onConnect: () => {
                client.subscribe(`/private/chat/${roomNo}`, (message) => {
                    const data = JSON.parse(message.body);
                    setMessageList(prev => {
                        const updatedList = [...prev, data];
                        localStorage.setItem(`messages_${roomNo}`, JSON.stringify(updatedList)); // 로컬 스토리지에 저장
                        return updatedList;
                    });
                });

                setConnect(true);
            },
            onDisconnect: () => {
                setConnect(false);
            },
            debug: (str) => {
                console.log(str);
            }
        });

        client.activate();
        return client;
    }, [roomNo, accessToken, refreshToken]);

    const disconnectFromServer = useCallback((client) => {
        if (client) {
            client.deactivate();
        }
    }, []);

    const sendMessage = useCallback(() => {
        if (client === null || connect === false || input.length === 0) return;

        client.publish({
            destination: `/app/room/${roomNo}`,
            headers: {
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            body: JSON.stringify({ content: input })
        });
        setInput("");
    }, [input, client, connect, roomNo, accessToken, refreshToken]);

    // view
    return (
        <>
            <Jumbotron title={"방 제목"} content={`채팅방 ${roomNo}`} />

            <div className="row mt-4">
                <div className="col">
                    <div className="input-group">
                        <input type="text" value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyUp={e => e.key === 'Enter' && sendMessage()}
                            className="form-control" />
                        <button className="btn btn-primary" onClick={sendMessage}>보내기</button>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-9">
                    <ul className="list-group">
                        {messageList.map((message, index) => (
                            <li className="list-group-item" key={index}>
                                {message.type === "chat" && (
                                    <div className="row">
                                        <div className={`col-5${(login && memberId === message.senderMemberId) && ' offset-7'}`}>
                                            {(login && memberId !== message.senderMemberId) && (
                                                <h3>
                                                    {message.senderMemberId}
                                                    <small>({message.senderMemberLevel})</small>
                                                </h3>
                                            )}
                                            <p>{message.content}</p>
                                            <p className="text-muted">
                                                {moment(message.time).format("a h:mm")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {message.type === "dm" && (
                                    <div className="row">
                                        <div className={`col-5${(login && memberId === message.senderMemberId) && ' offset-7'}`}>
                                            {(memberId === message.receiverMemberId) && (
                                                <h3 className="text-danger">
                                                    {message.senderMemberId} 님으로부터 온 메시지
                                                </h3>
                                            )}
                                            {(memberId === message.senderMemberId) && (
                                                <h3 className="text-danger">
                                                    {message.receiverMemberId} 님에게 보낸 메시지
                                                </h3>
                                            )}
                                            <p className="text-danger">{message.content}</p>
                                            <p className="text-muted">
                                                {moment(message.time).format("a h:mm")}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default RoomChat;
