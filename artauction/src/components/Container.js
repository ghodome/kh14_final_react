import Artist from "./Artist/Artist";
import ArtistRegist from "./Artist/ArtistRegist";
import AuctionSchedule from "./Auction/AuctionSchedule";
import Home from "./Home";
import MemberJoin from "./Member/MemberJoin";
import MemberLogin from "./Member/MemberLogin";
import Menu from "./Menu";
import Notice from "./Notice/Notice";
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
                        <Route path="/work" element={<WorkRegist/>}/>
                        <Route path="/artist" element={<Artist/>}/>
                        <Route path="/artist/regist" element={<ArtistRegist/>}/>
                        <Route path="/auctionschedule" element={<AuctionSchedule/>}/>
                        <Route path="/notice" element={<Notice/>}/>
                    </Routes>
                </div>
            </div>
        </div>
    </>)
}

export default Container;