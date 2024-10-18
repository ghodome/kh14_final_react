import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const NoticeDetail = ()=>{
    //파라미터
    const {noticeNo} = useParams();

    //navigator
    const navigate = useNavigate();
    
    //state
    const [notice, setNotice] = useState(null);
    

    //effect
    useEffect(()=>{
        loadNotice();
    }, []);

    //callback
    const loadNotice = useCallback(async () =>{
        const resp = await axios.get("http://localhost:8080/notice/"+noticeNo);
        setNotice(resp.data);
    }, [notice, noticeNo]);


    //view
    return(
     notice !== null ? (
            <>
                <h1>{notice.noticeTitle}</h1>
                <p>{notice.noticeContent}</p>
                <p>작성자: {notice.noticeMemberId}</p>
                <p>게시일: {new Date(notice.noticeWtime).toLocaleString()}</p>

                <button type="button" className="btn btn-secondary" onClick={e=> navigate("/notice")}>목록</button>
            </>) : (<> </>))};
export default NoticeDetail;