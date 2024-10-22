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
    key:"loginState",
    get: (state)=>{
        
        
        const memberId = state.get(memberIdState);
       
        const memberRank = state.get(memberRankState);

        return memberId.length > 0 && memberRank.length > 0;
    }
});

const memberLoadingState = atom({
    key:"memberLoadingState",
    default:false
});

export { countState, memberIdState, memberRankState, loginState, memberLoadingState };