import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, memberIdState, memberRankState } from "../utils/recoil";


const Menu = () => {
  const navigate = useNavigate();
  const [memberId, setMemberId] = useRecoilState(memberIdState);
  const [memberRank, setMemberRank] = useRecoilState(memberRankState);
  const login = useRecoilValue(loginState);

  const [time, setTime] = useState();
  const [timeToShow, setTimeToShow] = useState();

  const getTime = useCallback(async () => {
    try {
      const resp = await axios.get("http://localhost:8080/time/");
      const currentTime = resp.data;
      const date = new Date(currentTime);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      setTime(date);
      setTimeToShow(`${hours}:${minutes}:${seconds}`);
    } catch (error) {
      console.error("시간 요청 오류:", error);
    }
  }, []);

  const afterSecond = useCallback(() => {
    setTime((prevTime) => {
      if (!prevTime) return;


      const date = new Date(prevTime);
      date.setSeconds(date.getSeconds() + 1);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      setTimeToShow(`${hours}:${minutes}:${seconds}`);
      return date;
    });
  }, []);

  useEffect(() => {
    getTime();
    const intervalId = setInterval(() => {
      getTime();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [getTime]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      afterSecond();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [afterSecond]);

  const logout = useCallback(() => {
    setMemberId("");
    setMemberRank("");
    delete axios.defaults.headers.common["Authorization"];
    window.localStorage.removeItem("refreshToken");
    window.sessionStorage.removeItem("refreshToken");
    navigate("/");
  }, [navigate, setMemberId, setMemberRank]);

  return (
    <>
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
              <li className="nav-item">
                <NavLink className="nav-link" to="/charge">포인트 충전하기</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/payment">결제하기</NavLink>
              </li>
            </ul>
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <NavLink className="nav-link" to="#">{timeToShow && (<div>{timeToShow}</div>)}</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );


};

export default Menu;
