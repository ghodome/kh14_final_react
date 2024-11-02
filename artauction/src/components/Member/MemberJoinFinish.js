import React from 'react';
import { useNavigate } from 'react-router-dom';
import Jumbotron from '../Jumbotron';

const MemberJoinFinish = () => {
    const navigate = useNavigate();

    const handleNavigateHome = () => {
        navigate("/");
    };

    return (
        <div className="row">
            <div className="col-md-6 offset-md-3">
                <Jumbotron title="회원가입 완료" />
                <div className="alert alert-success mt-4">
                    회원가입이 완료되었습니다! 이제 로그인할 수 있습니다.
                </div>
                <div className="row mt-4">
                    <div className="col">
                        <button className="btn btn-primary w-100" onClick={handleNavigateHome}>
                            홈으로 가기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberJoinFinish;
