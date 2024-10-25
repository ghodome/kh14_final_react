import { useRecoilValue } from "recoil";
import { memberLoadingState, memberRankState } from "../../utils/recoil";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ element }) => {
    const memberRank = useRecoilValue(memberRankState);
    const memberLoading = useRecoilValue(memberLoadingState);

    if(memberLoading === false) {
        return <h1>Loading...</h1>
    } 

    return memberRank === '관리자' ? element : <Navigate to="/" />;
};

export default AdminRoute;
    