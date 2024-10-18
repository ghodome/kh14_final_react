import Artist from "./Artist/Artist";
import ArtistRegist from "./Artist/ArtistRegist";
import Home from "./Home";
import MemberJoin from "./Member/MemberJoin";
import MemberLogin from "./Member/MemberLogin";
import Menu from "./Menu";
import Notice from "./Notice/Notice";
import NoticeDetail from "./Notice/NoticeDetail";
import WorkRegist from "./work/WorkRegist";
import {Routes, Route } from 'react-router-dom';

const Container =()=>{
    return (<>
        <div className="container-fluid">
            <div className="row">
                <div className="col my-5 pt-4 pt-sm-5">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/join" element={<MemberJoin/>}/>
                        <Route path="/login" element={<MemberLogin/>}/>
                        <Route path="/work" element={<WorkRegist/>}/>
                        <Route path="/artist" element={<Artist/>}/>
                        <Route path="/artist/regist" element={<ArtistRegist/>}/>
                        <Route path="/notice" element={<Notice/>}/>
                        <Route path="/notice/detail/:noticeNo" element={<NoticeDetail/>}/>
                    </Routes>
                </div>
            </div>
        </div>
    </>)
}

export default Container;