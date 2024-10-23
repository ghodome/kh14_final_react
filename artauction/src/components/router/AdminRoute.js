import { useRecoilValue } from "recoil";
import { memberRankState } from "../../utils/recoil";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ element }) => {
    const memberRank = useRecoilValue(memberRankState);

    return memberRank === '관리자' ? element : <Navigate to="/" />;
};

export default AdminRoute;
