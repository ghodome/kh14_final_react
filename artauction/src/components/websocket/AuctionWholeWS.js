import { useCallback, useState } from "react";
import { useRecoilValue } from "recoil";
import SockJS from "sockjs-client";
import { loginState, memberIdState, memberLoadingState, memberRankState } from "../../utils/recoil";

const AuctionWholeWS = ()=>{
    //state
    const [client, setClient]=useState();
    const [connect, setConnect]=useState();
    const [messageList, setMessageList] = useState([]);
    
    //recoil
    const login=useRecoilValue(loginState);
    const accessToken=axios.defaults.headers.common["Authorization"];
    const refreshToken=window.localStorage.getItem("refreshToken1")
                        ||window.sessionStorage.getItem("refreshToken1");
    const memberId=useRecoilValue(memberIdState);
    const memberRank=useRecoilValue(memberRankState);
    const memberLoading=useRecoilValue(memberLoadingState);

    //callback
    const connectToServer = useCallback(()=>{
        const socket = new SockJS("/ws");
    },[connect])

    const loadMessageList= useCallback(async ()=>{
        const resp=await axios.get("/message/");
        setMessageList(resp.data);
    },[messageList])

    //effect
    useEffect(()=>{
        loadMessageList();
    },[])

    return(<>

        </>)
}

export default AuctionWholeWS;