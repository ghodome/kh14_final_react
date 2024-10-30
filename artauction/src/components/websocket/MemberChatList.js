import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useNavigate } from "react-router";

const MemberChatList = () => {
    const navigate = useNavigate();
    const [roomList, setRoomList] = useState([]);
    const [input, setInput] = useState({ roomName: "" });

    useEffect(() => {
        loadRoomList();
    }, []);

    const loadRoomList = useCallback(async () => {
        try {
            const resp = await axios.get("http://localhost:8080/room/");
            setRoomList(resp.data);
        } catch (error) {
            console.error("Failed to load room list:", error);
        }
    }, []);

    const changeInput = useCallback(e => {
        setInput({ [e.target.name]: e.target.value });
    }, []);

    const saveInput = useCallback(async () => {
        try {
            await axios.post("http://localhost:8080/room/", input);
            loadRoomList();
            setInput({ roomName: "" });
        } catch (error) {
            console.error("Failed to save room:", error);
        }
    }, [input]);

    const deleteRoom = useCallback(async (target) => {
        try {
            await axios.delete("http://localhost:8080/room/" + target.roomNo);
            loadRoomList();
        } catch (error) {
            console.error("Failed to delete room:", error);
        }
    }, []);

    const enterRoom = useCallback(async (target) => {
        await axios.post("http://localhost:8080/room/enter", { roomNo: target.roomNo });
        loadRoomList();
        navigate("/roomchat/" + target.roomNo);
    }, []);

    const leaveRoom = useCallback(async (target) => {
        await axios.post("http://localhost:8080/room/leave", { roomNo: target.roomNo });
        loadRoomList();
    }, []);

    return (
        <>
            <Jumbotron title="채팅방 " />
            <div className="row mt-4">
                <div className="col">
                    <div className="input-group">
                        <input type="text" name="roomName" className="form-control"
                            value={input.roomName} onChange={changeInput} />
                        <button className="btn btn-primary"
                            onClick={saveInput}>
                            등록
                        </button>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <ul className="list-group list-group-flush">
                        {roomList.map(room => (
                            <li className="list-group-item" key={room.roomNo}>
                                <h3>
                                    <span className="badge bg-primary me-4">
                                        {room.roomNo}
                                    </span>
                                    {room.roomName}
                                    {room.join === 'Y' && (
                                        <span className="badge bg-success ms-4">
                                            참여중
                                        </span>
                                    )}
                                </h3>

                                {room.join === 'N' ? (
                                    <button className="btn btn-success"
                                        onClick={e => enterRoom(room)}>입장</button>
                                ) : (
                                    <button className="btn btn-secondary"
                                        onClick={e => leaveRoom(room)}>퇴장</button>
                                )}
                                <button className="btn btn-warning ms-2">이름변경</button>
                                <button className="btn btn-danger ms-2"
                                    onClick={e => deleteRoom(room)}>삭제</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default MemberChatList;
