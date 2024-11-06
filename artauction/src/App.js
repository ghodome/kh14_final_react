
import axios from 'axios';
import Container from './components/Container';
import Menu from './components/Menu';
import { memberIdState, memberLoadingState, memberPointState, memberRankState } from './utils/recoil';
import { useCallback, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Footer from './components/Footer';


const App = () => {

 //recoil state
 const [memberId, setMemberId] = useRecoilState(memberIdState);
 const [memberRank, setMemberRank] = useRecoilState(memberRankState);
 const [memberLoading, setMemberLoading] = useRecoilState(memberLoadingState);
 const [memberPoint, setMemberPoint]=useRecoilState(memberPointState);

 //최초 1회 실행
 useEffect(()=>{
   refreshLogin();
 }, []);
 

 //callback
 const refreshLogin = useCallback(async ()=>{
   //[1] sessionStorage에 refreshToken이라는 이름의 값이 있는지 확인
   const sessionToken = window.sessionStorage.getItem("refreshToken1");
   //[2] localStorage에 refreshToken이라는 이름의 값이 있는지 확인
   const localToken = window.localStorage.getItem("refreshToken1");
   //[3] 둘다 없으면 차단
   if(sessionToken === null && localToken === null) {
     setMemberLoading(true);
     return;
   }
   //[4] 둘 중 하나라도 있다면 로그인 갱신을 진행
   const refreshToken = sessionToken || localToken;

   //[5] 헤더에 Authorization 설정
   axios.defaults.headers.common["Authorization"] = "Bearer " + refreshToken;

   //[6] 백엔드에 갱신 요청을 전송
   const resp = await axios.post("http://localhost:8080/member/refresh");

   //[7] 갱신 성공 시 응답(resp)에 담긴 데이터들을 적절하게 분배하여 저장(로그인과 동일)
   setMemberId(resp.data.memberId);
   setMemberRank(resp.data.memberRank);
   setMemberPoint(resp.data.memberPoint);
   axios.defaults.headers.common["Authorization"] = "Bearer " + resp.data.accessToken;
   if(window.localStorage.getItem("refreshToken1") !== null) {
     window.localStorage.setItem("refreshToken1", resp.data.refreshToken);
   }
   else {
     window.sessionStorage.setItem("refreshToken1", resp.data.refreshToken);
   }

   setMemberLoading(true);
 }, []); 

  return (<>

    <Menu />
    <div id='wrapper' style={{minHeight:'600px'}}>
    <Container />0
     
    </div>
    <Footer/>
  </>
  );
}

export default App;
  