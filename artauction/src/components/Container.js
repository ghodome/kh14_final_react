import Artist from "./Artist/Artist";
import AuctionDetail from "./Auction/AuctionDetail"
import AuctionSchedule from "./Auction/AuctionSchedule";
import Faq from "./faq/Faq";
import Home from "./Home";
import ChangePw from "./Member/ChangePw";
import FindPw from "./Member/FindPw";
import MemberJoin from "./Member/MemberJoin";
import MemberLogin from "./Member/MemberLogin";
import Notice from "./Notice/Notice";
import WorkList from "./work/WorkList";
import NoticeDetail from "./Notice/NoticeDetail";
import { Routes, Route } from 'react-router-dom';
import Mypage from "./Member/Mypage";
import MemberUpdate from "./Member/MemberUpdate";
import WebSocket from "./websocket/WebSocket";
import { useRecoilValue } from "recoil";
import { loginState } from "../utils/recoil";

import Charge from "./Member/Charge";
import ChargeSuccess from "./Member/ChargeSuccess";

import AuctionScheduleDetail from "./Auction/AuctionScheduleDetail";
import AuctionList from './Auction/AuctionList';

import Payment from "./Payment/Payment";
import PaymentSuccess from "./Payment/PaymentSuccess";

import PrivateRoute from "./router/PrivateRoute";
import MemberSearch from "./Member/MemberSearch";
import Items from "./RandomBox/Items";
import AdminRoute from "./router/AdminRoute";
import MemberDetail from "./Member/MemberDetail";

import MemberChatList from "./websocket/MemberChatList";
import MemberChatRoom from "./websocket/MemberChatRoom";

import MemberEdit from "./Member/MemberEdit";




const Container = () => {
    const login = useRecoilValue(loginState);

    return (<>
        <div className="container-fluid">
            <div className="row my-5 pt-3">
                <div className="col-sm-10 offset-sm-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/join" element={<MemberJoin />} />
                        <Route path="/login" element={<MemberLogin />} />
                        <Route path="/member/update" element={<PrivateRoute element={<MemberUpdate />} />} />

                        <Route path="/member/myPage" element={<PrivateRoute element={<Mypage />} />} />
                        <Route path="/admin/member/list" element={<AdminRoute element={<MemberSearch />} />} />
                        <Route path="admin/member/detail/:memberId" element={<AdminRoute element={<MemberDetail />} />} />
                        <Route path="admin/member/edit/:memberId" element={<AdminRoute element={<MemberEdit />} />} />
                        <Route path="/work/list" element={<WorkList />} />
                        <Route path="/findPw" element={<FindPw />} />
                        <Route path="/changePw/:token" element={<ChangePw />} />
                        <Route path="/artist" element={<Artist />} />
                        <Route path="/auctionschedule" element={<AuctionSchedule />} />
                        <Route path="/auctionschedule/detail/:auctionScheduleNo" element={<AuctionScheduleDetail />} />
                        <Route path="/notice" element={<Notice />} />
                        <Route path="/auctionList/:auctionScheduleNo" element={<AuctionList />} />
                        <Route path="/auction/detail/:auctionNo" element={<AuctionDetail />} />
                        <Route path="/notice/detail/:noticeNo" element={<NoticeDetail />} />
                        <Route path="/faq" element={<Faq />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/payment/success/:partnerOrderId" element={<PaymentSuccess />} />
                        <Route path="/charge" element={<Charge />} />
                        <Route path="/charge/success/:partnerOrderId" element={<ChargeSuccess />} />
                        <Route path="/websocket" element={<WebSocket />} />

                        <Route path="/websocket/memberchatlist" element={<MemberChatList />} />
                        <Route path="/websocket/memberchatroom" element={<MemberChatRoom />} />

                        <Route path="/randomBox" element={<Items/>}/>


                    </Routes>
                </div>
            </div>
        </div>
    </>)
}

export default Container;