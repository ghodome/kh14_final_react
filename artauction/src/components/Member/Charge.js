import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { loginState, memberLoadingState } from "../../utils/recoil";
import Modal from "react-modal";

const Charge = ()=>{
    const [money, setMoney] = useState(0);
    const getCurrentUrl = useCallback(()=>{
        return window.location.origin + window.location.pathname + (window.location.hash||'');
    },[])
    const [refund,setRefund] = useState(0);
    const [list,setList] = useState([]);
    const [memberPw, setMemberPw] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [member, setMember] = useState({
        memberId: ""
    });

    // 로그인 관련 상태
     const login = useRecoilValue(loginState); //리코일 생기면 이걸로 ㄱㄱ
    // const login = true;
     const memberLoading = useRecoilValue(memberLoadingState);
    // const memberLoading = true;
    useEffect(()=>{
        if(login===true&&memberLoading===true){
        loadList();
        }
    },[login,memberLoading]);

    useEffect(() =>{
        loadMember();
    }, []);

    const loadMember = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/member/find");
        setMember(resp.data[0]);
    }, []);

    const loadList = useCallback(async()=>{
        const resp = await axios.get("http://localhost:8080/charge/");
        setList(resp.data);
    },[]);

    const sendPurchaseRequest = useCallback(async ()=>{
        if(money === 0) return;

        const resp = await axios.post(
                    "http://localhost:8080/member/charge/purchase", 
                    {
                        totalAmount : money,
                        approvalUrl : getCurrentUrl() + "/success",
                        cancelUrl : getCurrentUrl() + "/cancel",
                        failUrl : getCurrentUrl() + "/fail",
                    }
        );
        
        console.log(resp.data);

        //결제 페이지 이동 전에 필요한 항목들을 모두 sessionStorage에 저장
        //[1] 거래번호(tid)
        window.sessionStorage.setItem("tid", resp.data.tid);
        //결제 페이지로 이동
        window.location.href = resp.data.next_redirect_pc_url;
    }, [money,getCurrentUrl]);
    const sendRefundRequest = useCallback(async()=>{
        if(refund ===0)return;
        try{
            await axios.post("http://localhost:8080/member/verfiyPw",null, {
                params: {
                    memberId: member.memberId, 
                    memberPw: memberPw
                }
            });

            const resp = await axios.post("http://localhost:8080/member/refund/"+refund);
            console.log(resp.data);
            alert("환불 성공!");
        }
        catch{
            alert("비밀번호가 올바르지 않거나 포인트가 부족합니다");
            return;
        }
        finally{
            setRefund(0);
            setMemberPw("");
            handleClose();
        }
    },[refund, memberPw]);

    const handleShow = () => setShowModal(true);
    const handleClose = () => {
        setShowModal(false);
        setMemberPw("");
    };

    //view
    return(<>
    <Jumbotron title="포인트 충전/환불"/>
        <div className="row mt-4">
            <div className="col-6">
            <h2>포인트 충전</h2>
                <input className="form-control w-100" value={money.toLocaleString()} readOnly/>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 10000)}>+10,000</button>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 100000)}>+100,000</button>
                <button className="btn btn-secondary m-3"onClick={e=>setMoney(money + 1000000)}>+1,000,000</button>
                <button className="btn btn-dark text-light float-end m-3" onClick={sendPurchaseRequest}>충전하기</button>
                <button className="btn  btn-light text-dark float-end m-3"onClick={e=>setMoney(0)}>초기화하기</button>
            </div>
            <div className="col-6">
            <h2>포인트 환불</h2>
                <input className="form-control w-100" value={refund.toLocaleString()} readOnly></input>
                <button className="btn btn-secondary m-3"onClick={e=>setRefund(refund + 10000)}>+10,000</button>
                <button className="btn btn-secondary m-3"onClick={e=>setRefund(refund + 100000)}>+100,000</button>
                <button className="btn btn-secondary m-3"onClick={e=>setRefund(refund + 1000000)}>+1,000,000</button>

                <button className="btn btn-dark text-light float-end m-3" onClick={handleShow}>환불하기</button>
                <button className="btn  btn-light text-dark float-end m-3"onClick={e=>setRefund(0)}>초기화하기</button>

            </div>
        </div>

         {/* 비밀번호 인증 모달 추가 */}
        <Modal
    isOpen={showModal}
    onRequestClose={handleClose}
    ariaHideApp={false}
    style={{
        content: {
            maxWidth: '400px', // 최대 너비
            maxHeight: '200px', // 최대 높이
            margin: 'auto', // 중앙 정렬
            padding: '10px', // 적절한 패딩
            overflow: 'auto', // 내용이 많을 경우 스크롤 추가
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // 어두운 배경
        }
    }}
>
    <h2>비밀번호를 입력하세요</h2>
    <input
        type="password"
        className="form-control mt-2"
        placeholder="비밀번호"
        value={memberPw}
        onChange={e => setMemberPw(e.target.value)}
    />
    <button className="btn btn-secondary ms-3 mt-3" onClick={handleClose}>취소</button>
    <button className="btn btn-primary ms-3 mt-3" onClick={sendRefundRequest}>인증하기</button>
</Modal>


        <div className="row mt-4">
            <div className="col-3"></div>
            <div className="col-6">
                <h2>충전 내역</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>충전 금액</th>
                            <th>충전 일자</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map(list=>(
                        <tr key={list.chargeNo}>
                            <td>{list?.chargeTotal.toLocaleString()||''}원</td>
                            <td>{list?.chargeTime||''}</td>
                            <td></td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </>);
};
export default Charge;