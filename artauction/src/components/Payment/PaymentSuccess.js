import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Jumbotron from "../Jumbotron";
import { useRecoilValue } from "recoil";
import { loginState, memberLoadingState } from "../../utils/recoil";

const PaymentSuccess = () =>{
    //partnerOrderId 수신
   const {partnerOrderId} = useParams();
   const [dealList,setDealList] = useState([]);
   // 로그인 관련 상태
   const login = useRecoilValue(loginState); //리코일 생기면 이걸로 ㄱㄱ
    // const login = true;
   const memberLoading = useRecoilValue(memberLoadingState);
    // const memberLoading = true;
   //결제 승인 상태
   const [result,setResult] = useState(null);// null: 시작전 true:성공 false:실패
   

   //effect
   useEffect(()=>{
       if(login===true&&memberLoading===true){

           sendApproveRequest();
        }   
    },[login,memberLoading]);
    

   //callback
   const sendApproveRequest = useCallback(async()=>{
    const query = new URLSearchParams(window.location.hash.split('?')[1]);
    const pgToken = query.get("pg_token");
      try{
       const resp = await axios.post(
           "/payment/approve",
           {
               partnerOrderId : partnerOrderId,
               pgToken : pgToken,
               tid : window.sessionStorage.getItem("tid"),
               dealList : JSON.parse(window.sessionStorage.getItem("checkedDealList"))
           }
           
       );
      
       setDealList(JSON.parse(window.sessionStorage.getItem("checkedDealList")))
       setResult(true);//성공
      }
      catch(e){
       setResult(false);//실패
      }
      finally{
       window.sessionStorage.removeItem("tid");
       window.sessionStorage.removeItem("checkedDealList");
      }
   },[login,memberLoading]);
   if(result===null){
       return(<>
           <h1>결제 진행중....</h1>
       </>)
   }
   else if(result ===true){
   return (<>
       <h1>결제 상품 구매 완료</h1>
       <div className="row mt-4">
           <div className="col">
            <table className="table">
                <thead>
                    <tr>
                        <th>작품명</th>
                        <th>판매가</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {dealList.map(deal=>(
                    <tr key={deal.dealNo}>
                        <td>{deal.workTitle}</td>
                        <td>{deal.dealPrice}.toLocaleString()||''</td>
                        <td>결제 완료</td>
                    </tr>
                    ))}
                </tbody>
            </table>
             
           </div>
       </div>
       
   </>);
   }
   else{
       return <h1>결제 승인 실패</h1>
   }

};
export default PaymentSuccess;