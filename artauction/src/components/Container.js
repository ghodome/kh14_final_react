import Artist from "./Artist/Artist";
import AuctionSchedule from "./Auction/AuctionSchedule";
import Home from "./Home";
import ChangePw from "./Member/ChangePw";
import FindPw from "./Member/FindPw";
import MemberJoin from "./Member/MemberJoin";
import MemberLogin from "./Member/MemberLogin";
import Notice from "./Notice/Notice";
import NoticeDetail from "./Notice/NoticeDetail";
import WorkRegist from "./work/WorkRegist";
import {Routes, Route } from 'react-router-dom';

const Container =()=>{
    return (<>
        <div className="container-fluid">
            <div className="row my-5 pt-3">
                <div className="col-sm-10 offset-sm-1">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/join" element={<MemberJoin/>}/>
                        <Route path="/login" element={<MemberLogin/>}/>
                        <Route path="/findPw" element={<FindPw/>}/>
                        <Route path="/changePw/:token" element={<ChangePw/>}/>
                        <Route path="/work" element={<WorkRegist/>}/>
                        <Route path="/artist" element={<Artist/>}/>
                        <Route path="/auctionschedule" element={<AuctionSchedule/>}/>
                        <Route path="/notice" element={<Notice/>}/>
                        <Route path="/notice/detail/:noticeNo" element={<NoticeDetail/>}/>
                    </Routes>
                </div>
            </div>
        </div>
    </>)
}

export default Container;