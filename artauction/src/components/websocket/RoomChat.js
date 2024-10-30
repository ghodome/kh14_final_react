import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { memberIdState, memberLoadingState } from "../../utils/recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import moment from "moment";

const RoomChat = () => {
    const { roomNo } = useParams();
    const navigate = useNavigate();
    const memberId = useRecoilValue(memberIdState);
    const memberLoading = useRecoilValue(memberLoadingState);

    const [input, setInput] = useState(""); // 채팅 입력값
    const [messageList, setMessageList] = useState([]); // 채팅 메시지
    const [userList, setUserList] = useState([]); // 참가자 목록
    const [client, setClient] = useState(null); // 웹소켓 통신 도구
    const [connect, setConnect] = useState(false); // 연결 상태

    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken") || window.sessionStorage.getItem("refreshToken");

    useEffect(() => {
        if (!memberLoading) return; // 로딩이 완료되지 않았다면 중지

       

        // 웹소켓 연결
        const client = connectToServer();
        setClient(client);
        return () => {
            disconnectFromServer(client); // 연결 종료
        };
    }, [memberLoading]);

    const connectToServer = useCallback(() => {
        const socket = new SockJS(process.env.REACT_APP_BASE_URL + "/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                accessToken: accessToken,
                refreshToken: refreshToken,
            },
            onConnect: () => {
                client.subscribe(`/private/chat/${roomNo}`, (message) => {
                    const data = JSON.parse(message.body);
                    setMessageList((prev) => [...prev, data]);
                });
                setConnect(true); // 연결 상태 갱신
            },
            onDisconnect: () => {
                setConnect(false); // 연결 상태 갱신
            },
            debug: (str) => {
                console.log(str);
            },
        });

        client.activate();
        return client;
    }, [memberLoading]);

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
                refreshToken: refreshToken,
            },
            body: JSON.stringify({ content: input }),
        });
        setInput(""); // 입력창 초기화
    }, [input, client, connect]);

   

    // 사용자 목록을 가져오는 useEffect
    useEffect(() => {
        const fetchUserList = async () => {
            const resp = await axios.get(`http://localhost:8080/room/users/${roomNo}`);
            setUserList(resp.data);
        };
        if (!memberLoading) {
            fetchUserList();
        }
    }, [roomNo, memberLoading]);

    return (
        <>
            <Jumbotron title={`${memberId}의 채팅방`} content={`${roomNo}번 채팅방`} />

            <div className="row mt-4">
                <div className="col">
                    <div className="input-group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyUp={(e) => e.key === "Enter" && sendMessage()}
                            className="form-control"
                        />
                        <button className="btn btn-primary" onClick={sendMessage}>
                            보내기
                        </button>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                {/* 사용자 목록 */}
                <div className="col-3">
                    <h4>참가자 목록</h4>
                    <ul className="list-group">
                        {userList.map((user, index) => (
                            <li className="list-group-item" key={index}>
                                {user === memberId ? `${user} (나)` : user}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 메시지 목록 */}
                <div className="col-9">
                    <ul className="list-group">
                        {messageList.map((message, index) => (
                            <li className="list-group-item" key={index}>
                                <div className={`row`}>
                                    <div className={`col-12`}>
                                        <h3>
                                            {message.senderMemberId} <small className="text-muted">{moment(message.time).format("a h:mm")}</small>
                                        </h3>
                                        <p>{message.content}</p>
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

export default RoomChat;
