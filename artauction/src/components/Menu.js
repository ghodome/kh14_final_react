import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Menu = ()=>{
      // state
      const [time, setTime] = useState();
      const [timeToShow, setTimeToShow] = useState();

      //callback
      const getTime = useCallback(async () => {
          const resp = await axios.get("http://localhost:8080/time/");
          const currentTime = resp.data;
          const date = new Date(currentTime);
          const timeDiff = currentTime.substring(20, 23);
  
              let hours = date.getHours().toString().padStart(2, '0');
              let minutes = date.getMinutes().toString().padStart(2, '0');
              let seconds = date.getSeconds().toString().padStart(2, '0');
  
              setTime(date);//서버시간의 시분초로 맞춘다 예) 46분 40초 340밀리초 > 46분 40초
              setTimeToShow(`${hours}:${minutes}:${seconds}`);
  
          setTimeout(() => {
              date.setMilliseconds(date.getMilliseconds() + (1000 - timeDiff));
  
              hours = date.getHours().toString().padStart(2, '0');
              minutes = date.getMinutes().toString().padStart(2, '0');
              seconds = date.getSeconds().toString().padStart(2, '0');
  
              setTime(date);
              setTimeToShow(`${hours}:${minutes}:${seconds}`);
          }, 1000 - timeDiff);//밀리초가 000이 됐을떄 한번 시간을 1초 증가시킨다.
      }, []);
  
      const afterSecond = useCallback(() => {//interval 1000ms 당 클라이언트 시간 1초 증가
          setTime((prevTime) => {
              if (!prevTime) return;
              
              const date = new Date(prevTime);
              date.setSeconds(date.getSeconds() + 1);
              
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const seconds = date.getSeconds().toString().padStart(2, '0');
            //   const milliseconds=date.getMilliseconds().toString().padStart(3, '0');
              
              setTimeToShow(`${hours}:${minutes}:${seconds}`);

              return date;
          });
      }, []);
  
      useEffect(() => {
          getTime();//일단 시간값을 받는다.
          const intervalId=setInterval(()=>{//30초마다 서버시간으로 갱신한다
            getTime();
          },30000);

          return ()=>clearInterval(intervalId);
      }, [getTime]);
  
      useEffect(() => {
          const intervalId = setInterval(() => {
              afterSecond();//interval 1000ms당 1초를 증가시킨다
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
                            <NavLink className="nav-link" to="/login">로그인</NavLink>
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
                            <NavLink className="nav-link" to="/faq">FAQ</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/websocket">websocket</NavLink>
                        </li>
                    </ul>
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="#">{timeToShow&&(<div>{timeToShow}</div>)}</NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </>)
}

export default Menu;