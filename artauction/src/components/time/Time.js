import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { endState } from "../../utils/recoil";

const Time = ({endDate})=>{
    const [time, setTime] = useState();
    const [timeToShow, setTimeToShow] = useState();
    const [end,setEnd]=useRecoilState(endState);

    const getTime = useCallback(async () => {
        try {
            const resp = await axios.get("http://localhost:8080/time/");
            const currentTime = resp.data;
            const date = new Date(endDate).getTime() - new Date(currentTime).getTime();
            const days = Math.floor(date / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');; // 일수
            if(days<0) setEnd(true);
            else setEnd(false);
            const hours = Math.floor((date / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');; // 남은 시간
            const minutes = Math.floor((date / (1000 * 60)) % 60).toString().padStart(2, '0');; // 남은 분
            const seconds = Math.floor((date / 1000) % 60).toString().padStart(2, '0');; // 남은 초
            setTime(date);
            setTimeToShow(`${days}일 ${hours}:${minutes}:${seconds}`);
        } catch (error) {
            console.log(error)
        }
    }, [endDate]);

    const afterTime = useCallback(() => {
        setTime((prevTime) => {
            if (!prevTime) return;

            const date = new Date(prevTime);
            date.setMilliseconds(date.getMilliseconds() - 10);
            const days = Math.floor(date / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');; // 일수
            if(days<0) setEnd(true);
            const hours = Math.floor((date / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');; // 남은 시간
            const minutes = Math.floor((date / (1000 * 60)) % 60).toString().padStart(2, '0');; // 남은 분
            const seconds = Math.floor((date / 1000) % 60).toString().padStart(2, '0');; // 남은 초

            setTimeToShow(`${days}일 ${hours}:${minutes}:${seconds}`);
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
            afterTime();
        }, 10);
        return () => clearInterval(intervalId);
    }, [afterTime]);
    return (<>
        {!end?timeToShow && (<div>{timeToShow}</div>):(<div>경매가 종료되었습니다</div>)}
    </>)
}

export default Time;