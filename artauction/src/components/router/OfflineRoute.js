
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, memberLoadingState } from "../../utils/recoil";
import { Navigate } from "react-router";

const OfflineRoute = (props)=>{
    //로그인 검사 결과를 불러온다
    //const [memberLoading] = useRecoilState(memberLoadingState);
    const memberLoading = useRecoilValue(memberLoadingState);
    const login = useRecoilValue(loginState);

    //로딩 진행중이잖아! 기다려!
    if(memberLoading === false) {
        return <h1>Loading...</h1>
    } 

    return login === false ? props.element : <Navigate to="/"/>;
};

export default OfflineRoute;