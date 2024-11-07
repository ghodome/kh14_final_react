import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useNavigate } from "react-router";

const Room = ()=>{
    //navigate
    const navigate = useNavigate();

    //state
    const [roomList, setRoomList] = useState([]);
    const [input, setInput] = useState({roomName:""});

    //effect
    useEffect(()=>{
        loadRoomList();
    }, []);

    //callback
    const loadRoomList = useCallback(async ()=>{
        const resp = await axios.get("/room/");
        setRoomList(resp.data);
    }, [roomList]);

    const changeInput = useCallback(e=>{
        //setInput({ roomName : e.target.value});
        setInput({ [e.target.name] : e.target.value });
    }, [input]);

    const saveInput = useCallback(async ()=>{
        const resp = await axios.post("/room/", input);
        loadRoomList();
        setInput({roomName:""});
    }, [input]);

    const deleteRoom = useCallback(async (target)=>{
        const resp = await axios.delete("/room/"+target.roomNo);
        loadRoomList();
    }, [roomList]);

    const enterRoom = useCallback(async (target)=>{
        await axios.post("/room/enter", {roomNo : target.roomNo});
        loadRoomList();
        //방으로 이동     
        navigate("/roomchat/"+target.roomNo);   
    }, [roomList]);

    const leaveRoom = useCallback(async (target)=>{
        await axios.post("/room/leave", {roomNo : target.roomNo});
        loadRoomList();
    }, [roomList]);

    //view
    return (<>
        <Jumbotron title="채팅방 예제"/>

        {/* 방 생성 화면 */}
        <div className="row mt-4">
            <div className="col">
                <div className="input-group">
                    <input type="text" name="roomName" className="form-control"
                                value={input.roomName} onChange={changeInput}/>
                    <button className="btn btn-primary"
                                onClick={saveInput}>
                        등록
                    </button>
                </div>
            </div>
        </div>

        {/* 방 목록 출력 */}
        <div className="row mt-4">
            <div className="col">

                <ul className="list-group list-group-flush">
                    {roomList.map(room=>(
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
                                onClick={e=>enterRoom(room)}>입장</button>
                        ) : (
                        <button className="btn btn-secondary"
                                onClick={e=>leaveRoom(room)}>퇴장</button>
                        )}
                        <button className="btn btn-warning ms-2">이름변경</button>
                        <button className="btn btn-danger ms-2"
                                onClick={e=>deleteRoom(room)}>삭제</button>
                    </li>
                    ))}
                </ul>

            </div>
        </div>
    </>);
};

export default Room;