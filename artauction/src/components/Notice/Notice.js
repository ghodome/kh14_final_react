import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";

const Notice = () => {
    //navigator
    const navigate = useNavigate();


    //state
    const [noticeList, setNoticeList] = useState([]);

    //effect
    useEffect(()=>{
        loadNoticeList();
    }, []);

    //callback
    const loadNoticeList = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/notice/list");
        setNoticeList(resp.data);
    }, [noticeList])

    //view
    return (<>
      <div className="container mt-4">
        <div className="row align-items-center">
          <div className="col-9 text-center w-100">
            <h2 >게시판</h2>
          </div>
          <div className="col-9">
          </div>
          <div className="col-3">
            <div className="d-flex justify-content-end">
              <input type="text" className="form-control me-2" placeholder="검색"/>
              <button className="btn btn-primary" style={{ flexShrink: 0 }}>
                검색
              </button>
            </div>
          </div>
        </div>
      </div>
  <div className="container mt-4">
    <table className="table table-bordered">
      <thead className="table-white">
      </thead>
      <tbody className="table">
        {noticeList.map(notice=>(
            <tr key={notice.noticeNo}>
                <td className="text-center">{notice.noticeType}</td>
                <td>
                    <NavLink to={"/notice/detail/"+notice.noticeNo}>{notice.noticeTitle}</NavLink>
                    </td>
                <td className="text-center">{notice.noticeWtime}</td>
            </tr>
            ))}
      </tbody>
    </table>
  </div>

    </>)
}

export default Notice;