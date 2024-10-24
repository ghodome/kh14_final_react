import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Jumbotron from "../Jumbotron";
import { useRecoilValue } from "recoil";
import { loginState, memberLoadingState } from "../../utils/recoil";

const ChargeSuccess = ()=>{
   //partnerOrderId 수신
   const {partnerOrderId} = useParams();

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
    console.log("pgToken = ",pgToken);
      try{
       const resp = await axios.post(
           "http://localhost:8080/member/charge/approve",
           {
               partnerOrderId : partnerOrderId,
               pgToken : pgToken,
               tid : window.sessionStorage.getItem("tid"),
           }
           
       );
      
       
       setResult(true);//성공
      }
      catch(e){
       setResult(false);//실패
      }
      finally{
       window.sessionStorage.removeItem("tid");
      }
   },[login,memberLoading]);
   if(result===null){
       return(<>
           <h1>결제 진행중....</h1>
       </>)
   }
   else if(result ===true){
   return (<>
       <Jumbotron title="포인트 구매 완료"/>
       <div className="row mt-4">
           <div className="col">
              <h3>홈으로</h3>
              <h3>마이페이지로</h3>
              <h3>경매 페이지로</h3>
           </div>
       </div>
       
   </>);
   }
   else{
       return <h1>결제 승인 실패</h1>
   }

};
export default ChargeSuccess;