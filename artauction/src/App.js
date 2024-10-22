
import Container from './components/Container';
import Menu from './components/Menu';
import { RecoilRoot, useRecoilState } from 'recoil';
import { memberIdState, memberLoadingState, memberRankState } from './utils/recoil';
import { useCallback, useEffect } from 'react';
import axios from 'axios';


const App = () => {

  const [memberId, setMemberId] = useRecoilState(memberIdState);
  const [memberRank, setMemberRank] = useRecoilState(memberRankState);
  const [memberLoading, setMemberLoading] = useRecoilState(memberLoadingState);

  useEffect(()=>{
    refreshLogin();
  }, []);

  const refreshLogin = useCallback(async ()=>{
    const sessionToken = window.sessionStorage.getItem("refreshToken");
    const localToken = window.localStorage.getItem("refreshToken");
    if(sessionToken === null && localToken === null){
      setMemberLoading(true);
      return;
    }
    const refreshToken = sessionToken || localToken;

    axios.defaults.headers.common["Authorization"] = "Bearer " + refreshToken;
    const resp = await axios.post("http://localhost:8080/member/refresh");
    setMemberId(resp.data.memberId);
    setMemberRank(resp.data.memberRank);
    axios.defaults.headers.common["Authorization"] = "Bearer " + resp.data.accessToken;
    if(window.localStorage.getItem("refreshToken") !== null){
      window.localStorage.setItem("refreshToken", resp.data.refreshToken);
    }
    else{
      window.sessionStorage.setItem("refreshToken", resp.data.refreshToken);
    }
    setMemberLoading(true);
  }, []);

  return (<>
        <Menu />
        <Container />
  </>
  );
}

export default App;
