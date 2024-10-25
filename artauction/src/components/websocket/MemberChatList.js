import { useState, useEffect } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import moment from "moment-timezone";
import { NavLink } from "react-router-dom";

const MemberChatList = () => {
    // state
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchChatRooms = async () => {
        try {
            const response = await axios.get("http://localhost:8080/roomchat/list");
            setRooms(response.data);
        } catch (error) {
            // console.error("error", error);
        }
    };

    // effect
    useEffect(() => {
        fetchChatRooms();
    }, []);

    const handleSearch = () => {
        // console.log("검색어:", searchTerm);
    };

    // views
    return (
        <>
            <Jumbotron title="채팅방" />
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control border-0"
                    placeholder="검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-outline-secondary" onClick={handleSearch}>
                    검색
                </button>
            </div>

            <div>
                {rooms.map((room) => {
                    const createdAt = moment(room.roomChatCreated).tz("Asia/Seoul");
                    const now = moment().tz("Asia/Seoul");
                    const isToday = createdAt.isSame(now, 'day');

                    return (
                        <NavLink key={room.roomChatNo} className="nav-link" to="/websocket/memberchatroom">
                            <div className="mb-3 border p-3">
                                <h5>방번호: {room.roomChatNo}</h5>
                                <span>아이디: {room.roomChatMemberId}</span>
                                <br />
                                <span>
                                    시간: {isToday ? createdAt.fromNow() : createdAt.format("YYYY-MM-DD")}
                                </span>
                            </div>
                        </NavLink>
                    );
                })}
            </div>
        </>
    );
};

export default MemberChatList;
