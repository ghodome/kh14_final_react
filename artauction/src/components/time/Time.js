import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const Time = ()=>{
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
    return (<>
        <ul className="navbar-nav me-auto">
            <li className="nav-item">
                <NavLink className="nav-link" to="#">{timeToShow && (<div>{timeToShow}</div>)}</NavLink>
            </li>
        </ul>
    </>)
}

export default Time;