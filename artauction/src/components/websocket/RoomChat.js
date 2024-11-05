import { useLocation, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import moment from "moment";

const RoomChat = () => {
    const { roomNo } = useParams();
    const navigate = useNavigate();

    const [input, setInput] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [client, setClient] = useState(null);
    const [connect, setConnect] = useState(false);

    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLoading = useRecoilValue(memberLoadingState);

    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken") || window.sessionStorage.getItem("refreshToken");

    const messageEndRef = useRef(null);

    useEffect(() => {
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

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messageList]);

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
                        localStorage.setItem(`messages_${roomNo}`, JSON.stringify(updatedList));
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

    return (
        <div style={styles.chatContainer}>
            <div style={styles.chatWindow}>
                <ul className="list-group" style={styles.messageList}>
                    {messageList.map((message, index) => (
                        <li className="list-group-item" key={index} style={styles.messageItem}>
                            {message.type === "chat" && (
                                <div className="row">
                                    <div className={`col-5${(login && memberId === message.senderMemberId) ? ' offset-7' : ''}`}>
                                        <div style={{
                                            ...styles.bubble,
                                            backgroundColor: (login && memberId === message.senderMemberId) ? '#dcf8c6' : '#f1f1f1',
                                            display: 'flex',
                                            justifyContent: (login && memberId === message.senderMemberId) ? 'flex-end' : 'flex-start',
                                        }}>
                                            {(login && message.senderMemberLevel === "admin") && (
                                                <h3>관리자</h3>
                                            )}
                                            <p>{message.content}</p>
                                        </div>
                                        <span style={styles.timestamp}>
                                            {moment(message.time).format("a h:mm")}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {message.type === "dm" && (
                                <div className="row">
                                    <div className={`col-5${(login && memberId === message.senderMemberId) ? ' offset-7' : ''}`}>
                                        <div style={{
                                            ...styles.bubble,
                                            backgroundColor: (login && memberId === message.senderMemberId) ? '#dcf8c6' : '#f1f1f1',
                                            marginLeft: (login && memberId === message.senderMemberId) ? 'auto' : '0',
                                            marginRight: 'auto',
                                            display: 'flex',
                                            justifyContent: (login && memberId === message.senderMemberId) ? 'flex-end' : 'flex-start',
                                        }}>
                                            {(memberId === message.receiverMemberId) && (
                                                <h3 className="text-danger"> {message.senderMemberId} 님으로부터 온 메시지</h3>
                                            )}
                                            {(memberId === message.senderMemberId) && (
                                                <h3 className="text-danger">{message.receiverMemberId} 님에게 보낸 메시지</h3>
                                            )}
                                            <p className="text-danger">{message.content}</p>
                                        </div>
                                        <span style={styles.timestamp}>
                                            {moment(message.time).format("a h:mm")}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                    <div ref={messageEndRef} />
                </ul>
            </div>

            <div style={styles.inputGroup}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyUp={e => e.key === 'Enter' && sendMessage()}
                    className="form-control"
                    style={styles.input}
                />
                <button className="btn" onClick={sendMessage} style={styles.sendButton}>보내기</button>
            </div>
        </div>
    );
};

const styles = {
    chatContainer: {
        width: '66.67%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#fff',
    },
    messageItem: {
        border: 'none',
        padding: '5px 0',
    },
    chatWindow: {
        flex: 1,
        overflowY: 'auto',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '10px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        scrollbarWidth: 'none',
        '-ms-overflow-style': 'none',
    },
    messageList: {
        padding: '0',
        listStyleType: 'none',
    },
    bubble: {
        display: 'inline-block',
        padding: '10px 15px',
        margin: '5px',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        wordWrap: 'break-word',
        whiteSpace: 'normal',
        maxWidth: '75%',
    },
    timestamp: {
        textAlign: 'right',
        fontSize: '12px',
        color: 'gray',
        marginTop: '-10px',
    },
    inputGroup: {
        marginTop: '10px',
        display: 'flex',
    },
    input: {
        flex: 1,
    },
    sendButton: {
        backgroundColor: 'black',
        color: 'white',
        border: 'none',
    },
};

export default RoomChat;
