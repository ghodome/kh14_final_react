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


import MemberEdit from "./Member/MemberEdit";
import MemberCheck from "./Member/MemberCheck";
import MemberPwChange from "./Member/MemberPwChange";
import RoomChat from "./websocket/RoomChat";
import Room from "./websocket/Room";
import Giveup from "./Payment/Giveup";
import OfflineRoute from "./router/OfflineRoute";
import MemberJoinFinish from "./Member/MemberJoinFinish";
import PaymentCancel from "./Payment/PaymentCancel";




const Container = () => {
    const login = useRecoilValue(loginState);

    return (<>
        <div className="container-fluid">
            <div className="row my-5 pt-3">
                <div className="col-sm-10 offset-sm-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/join" element={<OfflineRoute element={<MemberJoin />} />} />
                        <Route path="/join/finish" element={<OfflineRoute element={<MemberJoinFinish />} />} />
                        <Route path="/check" element={<OfflineRoute element={<MemberCheck />} />} />
                        <Route path="/login" element={<OfflineRoute element={<MemberLogin />} />} />
                        <Route path="/member/update" element={<PrivateRoute element={<MemberUpdate />} />} />
                        <Route path="/member/myPage" element={<PrivateRoute element={<Mypage />} />} />
                        <Route path="/member/pwChange" element={<PrivateRoute element={<MemberPwChange />} />} />
                        <Route path="/admin/member/list" element={<AdminRoute element={<MemberSearch />} />} />
                        <Route path="admin/member/detail/:memberId" element={<AdminRoute element={<MemberDetail />} />} />
                        <Route path="admin/member/edit/:memberId" element={<AdminRoute element={<MemberEdit />} />} />
                        <Route path="/work/list" element={<WorkList />} />
                        <Route path="/findPw" element={<OfflineRoute element={<FindPw />} />} />
                        <Route path="/changePw/:token" element={<OfflineRoute element={<ChangePw />} />} />
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
                        <Route path="/charge" element={<PrivateRoute element={ <Charge />}/>} />
                        <Route path="/charge/success/:partnerOrderId" element={<ChargeSuccess />} />
                        <Route path="/room" element={<PrivateRoute element={<Room />} />} />
                        <Route path="/randomBox" element={<PrivateRoute element={<Items />}/>} />
                        <Route path="/roomchat/:roomNo" element={<PrivateRoute element={<RoomChat />} />} />
                        <Route path="/giveup" element={<PrivateRoute element={<Giveup />} />} />
                        <Route path="/paymentcancel" element={<PrivateRoute element={<PaymentCancel />} />} />


                    </Routes>
                </div>
            </div>
        </div>
    </>)
}

export default Container;