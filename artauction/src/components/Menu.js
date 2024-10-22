import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Menu = ()=>{
      // state
      const [time, setTime] = useState();
      const [timeToShow, setTimeToShow] = useState();
  
      const getTime = useCallback(async () => {
          const resp = await axios.get("http://localhost:8080/time/");
          const currentTime = resp.data;
          const timeDiff = currentTime.substring(20, 23);
  
          setTimeout(() => {
              const date = new Date(currentTime);
              date.setMilliseconds(date.getMilliseconds() + (1000 - timeDiff));
  
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const seconds = date.getSeconds().toString().padStart(2, '0');
  
              setTime(date);
              setTimeToShow(`${hours}:${minutes}:${seconds}`);
          }, 1000 - timeDiff);
      }, []);
  
      const afterSecond = useCallback(() => {
          setTime((prevTime) => {
              if (!prevTime) return;
              
              const date = new Date(prevTime);
              date.setSeconds(date.getSeconds() + 1);
              
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const seconds = date.getSeconds().toString().padStart(2, '0');
              const milliseconds=date.getMilliseconds().toString().padStart(3, '0');
              
              setTimeToShow(`${hours}:${minutes}:${seconds}`);

              return date;
          });
      }, []);
  
      useEffect(() => {
          getTime();
      }, [getTime]);
  
      useEffect(() => {
          const intervalId = setInterval(() => {
              afterSecond();
          }, 1000);
  
          return () => clearInterval(intervalId);
      }, [afterSecond]);
  
    
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
                            <NavLink className="nav-link" to="#">{timeToShow&&(<p>{timeToShow}</p>)}</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/faq">FAQ</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/websocket">websocket</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/charge">포인트 충전하기</NavLink>
                        </li> 
                    </ul>
                </div>
            </div>
        </nav>
    </>)
}

export default Menu;