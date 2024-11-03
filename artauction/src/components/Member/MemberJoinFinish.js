import React from 'react';
import { useNavigate } from 'react-router-dom';
import Jumbotron from '../Jumbotron';

const MemberJoinFinish = () => {
    const navigate = useNavigate();

    const handleNavigateHome = () => {
        navigate("/");
    };

    return (<>
        <Jumbotron title="회원가입이 완료되었습니다." />
        <div style={{ marginTop: '30px', fontSize: '1.2rem' }}>
            <p>회원가입이 성공적으로 완료되었습니다!</p>
            <p>로그인 후 이용하실 수 있습니다.</p>
            <button className='btn btn-dark rounded-0 w-100' onClick={handleNavigateHome}
            >
                홈으로 이동
            </button>
        </div>
    </>
    );
};

export default MemberJoinFinish;
