import { atom, selector } from "recoil";


const countState = atom({
    key: "countState",
    default: 0,
});


const memberIdState = atom({
    key: "memberIdState",
    default: ""
});
const memberRankState = atom({
    key:"memberRankState",
    default:""
});

const loginState = selector({
    key: "loginState",
    get: ({ get }) => {
        const memberId = get(memberIdState);
        const memberRank = get(memberRankState);

        // memberId와 memberRank가 빈 문자열이 아닐 경우 true 반환
        return memberId && memberRank ? true : false;
    },
});

const memberLoadingState = atom({
    key:"memberLoadingState",
    default:false
});

export { countState, memberIdState, memberRankState, loginState, memberLoadingState };