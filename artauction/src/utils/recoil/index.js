/*
    Recoil을 이용한 통합 저장소
    - 전체 컴포넌트에 영향을 미칠 수 있는 데이터를 이곳에 저장
    - 대표적으로, 기존 레거시 웹에서의 HttpSession을 여기에 구현
    - 그렇다고 HttpSession은 아니며, 보안수준도 높지 않다
    - atom, selector라는 명령을 이용해서 필요한 구조를 구현
    - atom은 state처럼 사용할 데이터를 생성할 때 사용
    - selector는 atom으로 만들어내는 연관계산항목을 생성할 때 사용
    - 한줄요약 - atom(=state), selector(=memo)
*/

import {atom, selector} from "recoil";
import axios from "axios";

const countState = atom({
    key: "countState", //식별자(ID)
    default: 0,//초기값
});
export {countState};

//로그인 상태 - 회원ID, 회원 등급
const memberIdState = atom({
    key:"memberIdState",
    default: ""
});
const memberRankState = atom({
    key:"memberRankState",
    default:""
});

const blockedState = atom({
    key: 'blockedState',
    default: false,
});
const memberPointState=atom({
    key:"memberPointState",
    default:0
})
const endState=atom({
    key:"endState",
    default:false
})

const loginState = selector({
    key: "loginState",//식별자
    get: (state)=>{//state에서 원하는 항목을 읽어서 계산한 뒤 반환

        //atom으로 만든 state 중에 memberIdState를 가져오세요
        const memberId = state.get(memberIdState);
        //atom으로 만든 state 중에 memberLevelState를 가져오세요
        const memberRank = state.get(memberRankState);

        return memberId.length > 0 && memberRank.length > 0;
    }
});
export {memberIdState, memberRankState, loginState, blockedState, memberPointState, endState};

// axios.defaults.baseURL=process.env.REACT_APP_BASE_URL;
axios.defaults.baseURL=process.env.REACT_APP_BASE_URL;
axios.defaults.timeout=10000;
//axios customize
//- 환경설정(.env)에 정의된 값을 읽어온다
//- process.env.항목이름



//로그인 처리 완료 여부
const memberLoadingState = atom({
    key:"memberLoadingState",
    default:false
});
export {memberLoadingState};