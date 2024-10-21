import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Menu = ()=>{
    //state
    const [time, setTime]=useState();

    // callback
    const getTimeFromServer = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/time/");
        const currentTime = resp.data;
        const timeDiff = parseInt(currentTime.substring(20, 23), 10); // 서버 응답에서 밀리초 차이 추출

        const initialDate = new Date(currentTime); // 서버 시간을 Date 객체로 변환
        initialDate.setMilliseconds(initialDate.getMilliseconds() + (1000 - timeDiff)); // 밀리초 보정

        // 초기 시간을 설정
        setTime(`${initialDate.getUTCHours().toString().padStart(2, '0')}:${initialDate.getUTCMinutes().toString().padStart(2, '0')}:${initialDate.getUTCSeconds().toString().padStart(2, '0')}`);

        // 이후 1초마다 시간을 갱신
        const intervalId = setInterval(() => {
            initialDate.setSeconds(initialDate.getSeconds() + 1); // 1초 추가
            setTime(`${initialDate.getUTCHours().toString().padStart(2, '0')}:${initialDate.getUTCMinutes().toString().padStart(2, '0')}:${initialDate.getUTCSeconds().toString().padStart(2, '0')}`);
        }, 1000);

        // 컴포넌트 언마운트 시 interval 정리
        return () => clearInterval(intervalId);
    }, []);

    // effect
    useEffect(() => {
        getTimeFromServer(); // 서버에서 시간 가져오기
    }, [getTimeFromServer]);

    
    return(<>
        <nav className="navbar navbar-expand bg-light fixed-top" data-bs-theme="light">
            <div className="container-fluid">
                <div className="collapse navbar-collapse" id="top-menu">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/join">회원가입</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/artist">작가</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/auctionschedule">경매</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/work/list">작품</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/work/regist">작품등록</NavLink>
                        </li> 
                    </ul>
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/notice">공지사항</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="#">{time&&(<p>{time}</p>)}</NavLink>
                        </li> 
                    </ul>
                </div>
            </div>
        </nav>
    </>)
}

export default Menu;