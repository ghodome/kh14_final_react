import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { blockedState, loginState, memberIdState, memberPointState, memberRankState, endState } from "../../utils/recoil";
import { useRecoilState, useRecoilValue } from "recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import moment from "moment";
import styles from './auction.module.css';
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Modal } from "bootstrap";
import Time from "../time/Time";

const Auction = () => {
    //recoil
    const memberPoint=useRecoilValue(memberPointState);
    const end=useRecoilValue(endState);

    //ref
    const bidModal = useRef();
    const loading = useRef(false);
    //params
    const { auctionNo } = useParams();
    //navigate
    const navigate = useNavigate();
    // state
    const [point,setPoint]=useState(0);
    const [transferTime, setTranferTime]=useState();
    const [auctionAndWork, setAuctionAndWork] = useState({
        auctionStartPrice: 0,
        auctionBidIncrement: 0,
    });
    const [client, setClient] = useState(null);
    const [messageList, setMessageList] = useState([]);
    const [connect, setConnect] = useState(false);
    const [bidIncrement, setBidIncrement] = useState();
    const [input, setInput] = useState({
        type: "bid",
        bid: {
            workName: "",
            auctionLot: "",
            bidPrice: "",
            bidIncrement: "",
        }
    }); 

    const [wholeMessageList, setWholeMessageList] = useState([]);
    const [member, setMember] = useState({});
    const [bidIncrementUnit, setBidIncrementUnit]=useState();

    const [workImage, setWorkImage] = useState({
        attachment : null
    });
    const [loadComplete,setLoadComplete]=useState(false);

    //recoil
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberRank = useRecoilValue(memberRankState);
    const [blocked, setBlocked] = useRecoilState(blockedState);

    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken1") || window.sessionStorage.getItem("refreshToken1");

    //callback
    const clearInput = (() => {
        setInput({
            type: "bid",
            bid: {
                auctionLot: "",
                bidPrice: "",
                bidIncrement: "",
            }
        });
    },[])
    const loadAuctionAndWork=useCallback(async ()=>{
        const resp = await axios.get(`/auction/work/${auctionNo}`);
        setAuctionAndWork(resp.data);
        setTranferTime(resp.data.auctionEndDate);
        setBidIncrementByPrice(resp.data.auctionBidPrice>0?resp.data.auctionBidPrice:resp.data.auctionStartPrice);
        if(resp){
            setInput({
                type: "bid",
                bid: {
                    workName: auctionAndWork.workTitle,
                    auctionLot: auctionAndWork.auctionLot,
                    bidPrice: auctionAndWork.auctionBidPrice > 0 ? auctionAndWork.auctionBidPrice : auctionAndWork.auctionStartPrice,
                    bidIncrement: bidIncrement,
                },
            });
        }
        setLoadComplete(true);
    },[auctionNo,bidIncrement,auctionAndWork,transferTime,loadComplete]);

    const loadWorkImage = useCallback(async () => {
        try {
            const resp = await axios.get(`/auction/workImage/${auctionNo}`);
            const data = resp.data[0] || {}; // data[0]가 없는 경우 빈 객체로 설정
            setWorkImage({
                ...data,
                attachment: data.attachment || null // attachment가 없으면 null로 설정
            });
        } catch (error) {
            console.error("Failed to load work image:", error);
        }
    }, [auctionNo]);

    const setBidIncrementByPrice = useCallback((price) => {
        let increment;
        switch (true) {
            case (price < 1000000):
                increment = 50000;
                break;
            case (price >= 1000000 && price < 3000000):
                increment = 100000;
                break;
            case (price >= 3000000 && price < 5000000):
                increment = 200000;
                break;
            case (price >= 5000000 && price < 10000000):
                increment = 500000;
                break;
            case (price >= 10000000 && price < 30000000):
                increment = 1000000;
                break;
            case (price >= 30000000 && price < 50000000):
                increment = 2000000;
                break;
            case (price >= 50000000 && price < 200000000):
                increment = 5000000;
                break;
            default:
                increment = 10000000;
        }
        setBidIncrement(increment);
        setBidIncrementUnit(increment);
    }, [bidIncrement]);

    const loadMemberPoint=useCallback(async ()=>{
        const resp=await axios.get(`/member/point`);
        setPoint(resp.data);
    },[point])

    const connectToServer = useCallback(() => {
        const socket = new SockJS(`${process.env.REACT_APP_BASE_URL}/ws`);
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                client.subscribe("/auction/progress", (message) => {
                    const json = JSON.parse(message.body);
                    setMessageList(prev => [...prev, json]);
                });
                if (login) {
                    client.subscribe(`/auction/${auctionNo}`, (message) => {
                        const json = JSON.parse(message.body);
                        setMessageList(prev => [...prev, json]);
                    });
                }
                setConnect(true);
            },
            onDisconnect: () => {
                setConnect(false);
            },
            // debug:(str)=>{
            // console.log("[DEBUG] : "+str);
            // }
        });
        if (login === true) {
            client.connectHeaders = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        }
        client.activate();
        setClient(client);
    }, [client, login, accessToken, refreshToken]);

    const disconnectToServer = useCallback(() => {
        if (client) {
            client.deactivate();
        }
    }, [client]);

    const sendMessage = useCallback(async () => {
        loadMemberPoint();
        if(memberPoint<(input.bid.bidPrice+input.bid.bidIncrement)*0.3) {
            window.alert("보유 포인트가 부족합니다.")
            return;
        }
        const json = { content: input };

        if (client === null || !connect) {
            loadAuctionAndWork();
            return;
        } else if (blocked) {
            alert("차단된 회원입니다. 입찰할 수 없습니다.");
            return;
        }
        else {
            const bidResp = await axios.patch(`/auctionchat/${auctionNo}`, json.content);
            console.log(bidResp.data.success)
            if (bidResp.data.success) {
                window.alert(`LOT ${json.content.bid.auctionLot} ${json.content.bid.bidPrice + json.content.bid.bidIncrement}원 응찰에 성공하셨습니다.`);
            } else {
                window.alert(`동일 가격 차순위 응찰되었습니다.`);
            }
        }
        // 응찰 성공 후 새 bidPrice 업데이트를 위해 loadAuctionAndWork 호출
        loadAuctionAndWork();
    }, [input, client, connect, auctionAndWork, blocked, memberPoint]);

    const increaseBidIncrement = useCallback(() => {
        setInput({
            ...input,
            bid: {
                ...input.bid,
                bidIncrement: input.bid.bidIncrement + bidIncrement
            }
        })
    },[input,bidIncrement])

    const decreaseBidIncrement = useCallback(() => {
        setInput({
            ...input,
            bid: {
                ...input.bid,
                bidIncrement: input.bid.bidIncrement > bidIncrement ?
                    input.bid.bidIncrement - bidIncrement : input.bid.bidIncrement
            }
        })
    },[input,bidIncrement]);

    const loadMessageList = useCallback(async () => {
        const resp = await axios.get(`/bid/bidMessageList/${auctionNo}`);
        setWholeMessageList(resp.data);
    }, [wholeMessageList]);

    const openBidIncrementModal = useCallback(() => {
        const tag = Modal.getOrCreateInstance(bidModal.current);
        tag.show();
    }, [bidModal]);
    const closeBidIncrementModal = useCallback(() => {
        const tag = Modal.getInstance(bidModal.current);
        tag.hide();
    }, [bidModal]);

    //effect
    useEffect(() => {
        loadAuctionAndWork();
        connectToServer();
        loadMessageList();
        return () => {
            disconnectToServer(client);
        };
    }, [])

    useEffect(() => {
        loadWorkImage();
    }, [auctionNo]);

    useEffect(() => {
        
        if (auctionAndWork) {
            setInput((prev) => ({
                ...prev,
                bid: {
                    ...prev.bid,
                    workName: auctionAndWork.workTitle,
                    auctionLot: auctionAndWork.auctionLot,
                    bidPrice: auctionAndWork.auctionBidPrice > 0 ? auctionAndWork.auctionBidPrice : auctionAndWork.auctionStartPrice,
                    bidIncrement: bidIncrement,
                },
            }));
        };
    }, [auctionAndWork]);
    
    useEffect(() => {
        const loadMember = async () => {
            if (login) { // 로그인 상태일 때만 요청
                try {
                    const resp = await axios.get(`/member/${memberId}`);
                    setMember(resp.data);
                    setBlocked(resp.data.blocked);
                } catch (error) {
                    console.error("Failed to load member:", error);
                }
            }

        };
    
        loadMember();
    }, [memberId]);
    // view
    return (
        <>
            <div className={styles.auctionContainer}>
                <div className="mt-5 text-center">
                    {auctionAndWork && (<h4>{auctionAndWork.auctionScheduleNo}주차 경매 현황</h4>)}
                    
                    <ul className="list-group bg-light border border-top-1" style={{height:'13.5em'}}>
                        {messageList.slice(-5).map((message, index) => (
                            <div className="row mt-1" key={index}>
                                <div className="col-9 text-center ps-3">
                                    <p>{message.content.contentForSchedule}</p>
                                </div>
                                <div className="col-3">
                                    <p className="text-muted text-end pe-3">
                                        {moment(message.content.bidTime).format('H:mm:ss')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </ul>
                </div>

                {loadComplete ? (
                    <>
                        <div className="row mt-4">
                            <div className="col-7">
                                
                                <div className="border p-3 rounded bg-light">
                                {/* 작품 상세내용 */}
                                <div className="row my-2 text-center">
                                    <div className="col">
                                        {workImage.attachment ? (
                                            <img 
                                                src={`${process.env.REACT_APP_BASE_URL}/attach/download/${workImage.attachment}`} 
                                                className="img-thumbnail rounded-1 shadow-sm" 
                                                alt="이미지 정보 없음" 
                                                height="250px" 
                                                width="450px" 
                                            />
                                        ) : (
                                            <img 
                                                src="https://placehold.co/300x200"
                                                className="img-thumbnail rounded-1 shadow-sm" 
                                                alt="이미지 정보 없음" 
                                                height="250px" 
                                                width="450px" 
                                            />
                                        )}
                                    </div>
                                </div>
                                    <div className="row my-2">
                                        <div className="col font-weight-bold">{auctionAndWork.workTitle}</div>
                                    </div>
                                    <div className="row my-2">
                                        <div className="col text-muted">{auctionAndWork.workDescription}</div>
                                    </div>
                                    <div className="row my-2">
                                        <div className="col">{auctionAndWork.workMaterials}</div>
                                    </div>
                                    <div className="row my-2">
                                        <div className="col">{auctionAndWork.workSize}</div>
                                    </div>
                                    <div className="row my-2">
                                        <div className="col">{auctionAndWork.workCategory}</div>
                                    </div>
                                    {/* 작가 사진 */}
                                    <div className="row my-2">
                                        <div className="col text-muted">{auctionAndWork.artistName}</div>
                                    </div>
                                    <div className="row my-2">
                                        <div className="col">{auctionAndWork.artistDescription}</div>
                                    </div>
                                    <div className="row my-2">
                                        <div className="col">{auctionAndWork.artistMaterials}</div>
                                    </div>
                                    <div className="row my-2">
                                        <div className="col">
                                            {auctionAndWork.artistBirth} ~ {auctionAndWork.artistDeath}
                                        </div>
                                    </div>
                                    <div className="row text-end">
                                        <div className="col">
                                        <button className="btn btn-secondary rounded-1" onClick={e=>navigate(-1)}>목록 가기</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-5 m-0 p-0 border-left">
                                <div className="px-3 py-2 bg-dark text-white rounded-top">
                                    <h3>LOT {auctionAndWork.auctionLot}</h3>
                                </div>

                                <div className="p-3 border bg-light">
                                    <div className="row">
                                        <div className="col-6">일정번호: <span className="font-weight-bold">{auctionAndWork.auctionScheduleNo}</span></div>
                                        <div className="col-6 text-end">작품번호: <span className="font-weight-bold">{auctionAndWork.workNo}</span></div>
                                    </div>
                                </div>

                                <div className="p-3 bg-white shadow-sm rounded">
                                    <h5 className="mb-3">경매 진행 상황</h5>
                                    <div className="row mb-1">
                                        <div className="col-6">추정가</div>
                                        <div className="col-6 text-end font-weight-bold">{auctionAndWork.auctionLowPrice.toLocaleString('ko-KR')} 원</div>
                                    </div>
                                    <div className="row mb-1">
                                        <div className="col-6">~</div>
                                        <div className="col-6 text-end font-weight-bold">{auctionAndWork.auctionHighPrice.toLocaleString('ko-KR')} 원</div>
                                    </div>
                                    <div className="row mb-1">
                                        <div className="col-6">시작가</div>
                                        <div className="col-6 text-end font-weight-bold">{auctionAndWork.auctionStartPrice.toLocaleString('ko-KR')} 원</div>
                                    </div>
                                    <div className="row mb-1">
                                        <div className="col-6">현재가</div>
                                        <div className="col-6 text-end">
                                            <span className="font-weight-bold">{input?.bid.bidPrice.toLocaleString('ko-KR')} 원</span>
                                            <span className="ml-2 text-muted">({auctionAndWork.auctionBidCnt} 회)</span>
                                        </div>
                                    </div>
                                    <div className="row mb-1">
                                        <div className="col-6">호가 단위</div>
                                        <div className="col-6 text-end">
                                            <span onClick={openBidIncrementModal} className="text-info cursor-pointer">
                                                <IoMdInformationCircleOutline />
                                            </span>
                                            <span className="font-weight-bold ml-1">{bidIncrement?.toLocaleString('ko-KR')} 원</span>
                                        </div>
                                    </div>
                                    <div className="row mb-1">
                                        <div className="col-6">마감 시간</div>
                                        <div className="col-6 text-end">{moment(auctionAndWork.auctionEndDate).format('YYYY년 MM월 DD일 H:mm:ss')}</div>
                                    </div>
                                    <div className="row mb-1">
                                        <div className="col-6">남은 시간</div>
                                        <div className="col-6 text-end"><Time endDate={auctionAndWork.auctionEndDate}/></div>
                                    </div>
                                    <div className="row mb-1">
                                        <div className="col-6">보유 포인트</div>
                                        <div className="col-6 text-end font-weight-bold">
                                            {point ? point.toLocaleString('ko-KR') : memberPoint?.toLocaleString('ko-KR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="col">
                                    <div className="p-0">
                                            {login ?(
                                                <>
                                                        {blocked ? (
                                                            <div className="text-danger mb-2" style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                                                응찰 금지된 회원입니다.
                                                            </div>
                                                        ) : (
                                                                <div className="input-group flex-nowrap">
                                                                    {/* 버튼 */}
                                                                    <button 
                                                                        type="button" 
                                                                        className="btn btn-dark rounded-0" 
                                                                        onClick={increaseBidIncrement} disabled={end}>
                                                                        <FaArrowUp />
                                                                    </button>
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn btn-light rounded-0" 
                                                                            onClick={decreaseBidIncrement} disabled={end}>
                                                                            <FaArrowDown />
                                                                        </button>
                                                                        <div className="flex-grow-1 text-center"
                                                                            // type="text" 백엔드 코드가 /10 *5 인데.. 10개단위로 5분씩 올라간단 말이죠
                                                                            // className="flex-grow-1 text-center"
                                                                            // value={
                                                                                // input.bid.bidPrice !== 0 
                                                                                //     ? input.bid.bidPrice + input.bid.bidIncrement
                                                                                //     : auctionAndWork.auctionStartPrice + auctionAndWork.auctionBidIncrement
                                                                            // }
                                                                            // onChange={e =>
                                                                            //     setInput(prev => ({
                                                                            //         ...prev,
                                                                            //         bid: {
                                                                            //             ...prev.bid,
                                                                            //             bidPrice: e.target.value > 0 ? e.target.value : 0,
                                                                            //         },
                                                                            //     }))
                                                                            // }
                                                                            // placeholder="응찰 가격을 입력하세요"
                                                                        >{(input.bid.bidPrice !== 0 
                                                                            ? input.bid.bidPrice + input.bid.bidIncrement
                                                                            : auctionAndWork.auctionStartPrice + auctionAndWork.auctionBidIncrement).toLocaleString('ko-KR')}</div>
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn btn-dark rounded-0" 
                                                                            onClick={sendMessage} disabled={end}>
                                                                            응찰
                                                                        </button>
                                                                    {/* 버튼 끝 */}
                                                                </div>
                                                        )}
                                                </>
                                                ):(<div className="input-group flex-nowrap">
                                                        <button type="button" className="btn btn-primary rounded-0 w-100 m-0"
                                                        onClick={e=>navigate("/login")}>로그인 후 응찰이 가능합니다</button>
                                                </div>)}
                                    </div>
                                </div>
                                <div className="message-container" style={{ height: '400px', overflowY: 'auto' }}>
                                    <ul className="list-group">
                                        {messageList && messageList.slice().reverse().map((message, index) => (
                                            <div className="row" key={index}>
                                                <div className="col">
                                                    <p>{message.content.contentForLot}</p>
                                                    <p className="text-muted">
                                                        {moment(message.bidTime).format('HH:mm:ss')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </ul>
                                    <ul className="list-group">
                                        {wholeMessageList && wholeMessageList.slice().reverse().map((message, index) => (
                                            <div className="row" key={index}>
                                                <div className="col">
                                                    <p>{message.content.contentForLot}</p>
                                                    <p className="text-muted">
                                                        {moment(message.time).format('HH:mm:ss')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <hr />
                        </div>
                        <div className="modal fade" ref={bidModal}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">호가 단위 안내</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            aria-label="Close"
                                            onClick={closeBidIncrementModal}>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <table className="table table-striped table-bordered text-center" style={{ width: '100%', marginTop: '20px' }}>
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>현재가</th>
                                                    <th>호가 단위</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>300,000~999,999원</td>
                                                    <td>50,000원</td>
                                                </tr>
                                                <tr>
                                                    <td>1,000,000~2,999,999원</td>
                                                    <td>100,000원</td>
                                                </tr>
                                                <tr>
                                                    <td>3,000,000~4,999,999원</td>
                                                    <td>200,000원</td>
                                                </tr>
                                                <tr>
                                                    <td>5,000,000~9,999,999원</td>
                                                    <td>500,000원</td>
                                                </tr>
                                                <tr>
                                                    <td>10,000,000~29,999,999원</td>
                                                    <td>1,000,000원</td>
                                                </tr>
                                                <tr>
                                                    <td>30,000,000~49,999,999원</td>
                                                    <td>2,000,000원</td>
                                                </tr>
                                                <tr>
                                                    <td>50,000,000~199,999,999원</td>
                                                    <td>5,000,000원</td>
                                                </tr>
                                                <tr>
                                                    <td>200,000,000~499,999,999원</td>
                                                    <td>10,000,000원</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (<>
                    <div className="row mt-4">
                        <div className="col-7">
                            {/* 작품 상세내용  */}
                            <div className="row my-2 text-center">
                                <div className="col">
                                    <img src="https://placehold.co/300x200" className="img-thumbnail rounded-1" alt="" height='250px' width='450px' />
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 제목 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 작품 설명 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 재료 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 크기 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 카테고리 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 제목 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 작가 이름 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 작가 설명 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 작가 재료 자리 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 생년 ~ 사망 */}
                                </div>
                            </div>
                            <div className="row my-2">
                                <div className="col">
                                    {/* 빈 칸 */}
                                </div>
                            </div>
                        </div>
                        <div className="col-5 m-0 p-0">
                        <h2>LOT</h2>
                            <div className="row mt-2">
                                <div className="col-6">
                                    일정번호 : 
                                </div>
                                <div className="col-6">
                                    작품번호 : 
                                </div>
                            </div>
                            <div className="col">
                                <div className="col">경매 진행 상황
                                    
                                    </div>
                                <div className="col"></div>
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-4">추정가</div>
                                        <div className="col-8 text-end"> 원</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-4">~</div>
                                        <div className="col-8 text-end"> 원</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-4">시작가</div>
                                        <div className="col-8 text-end"> 원</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-4">현재가</div>
                                        <div className="col-3"> 회</div>
                                        <div className="col-5 text-end"> 원</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-4">호가 단위</div>
                                        <div className="col-3">
                                            <div onClick={e => openBidIncrementModal()}>
                                                <IoMdInformationCircleOutline />
                                            </div>
                                        </div>
                                        <div className="col-5 text-end"> 원</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-4">마감 시간</div>
                                        <div className="col-8 text-end"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-4">남은 시간</div>
                                        <div className="col-8 text-end"><Time /></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="row">
                                    <div className="row">
                                        <div className="col-4">보유 포인트</div>
                                        <div className="col-8 text-end"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div className="p-0">
                                    {login && (
                                        <>
                                            {blocked ? (
                                                <div className="text-danger mb-2" style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                                                    응찰 금지된 회원입니다.
                                                </div>
                                            ) : (
                                                <div className="input-group flex-nowrap">
                                                    {/* 버튼 */}
                                                    <button type="button" className="btn btn-dark rounded-0" onClick={increaseBidIncrement}>
                                                        <FaArrowUp />
                                                    </button>
                                                    <button type="button" className="btn btn-light rounded-0" onClick={decreaseBidIncrement}>
                                                        <FaArrowDown />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        className="flex-grow-1 text-center"
                                                        placeholder="응찰 가격을 입력하세요"
                                                    />
                                                    <button type="button" className="btn btn-dark rounded-0" onClick={sendMessage}>
                                                        응찰
                                                    </button>
                                                    {/* 버튼 끝 */}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            {messageList && messageList.slice().reverse().map((message, index) => (
                                <div className="row" key={index}>
                                    <div className="col">
                                        <p>{message.content.contentForLot}</p>
                                        <p className="text-muted">
                                            {moment(message.content.bidTime).format('HH:mm:ss')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <ul className="list-group">
                                {messageList && messageList.slice().reverse().map((message, index) => (
                                    <div className="row" key={index}>
                                        <div className="col">
                                            <p>{message.content.contentForLot}</p>
                                            <p className="text-muted">
                                                {moment(message.bidTime).format('HH:mm:ss')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </ul>
                            {wholeMessageList && wholeMessageList.slice().reverse().map((message, index) => (
                                <div className="row" key={index}>
                                    <div className="col">
                                        <p>{message.content.contentForLot}</p>
                                        <p className="text-muted">
                                            {moment(message.time).format('HH:mm:ss')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr />
                    </div>
                    <div className="modal fade" ref={bidModal}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">호가 단위 안내</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Close"
                                        onClick={closeBidIncrementModal}>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <table className="table table-striped table-bordered text-center" style={{ width: '100%', marginTop: '20px' }}>
                                        <thead className="table-dark">
                                            <tr>
                                                <th>현재가</th>
                                                <th>호가 단위</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>300,000~999,999원</td>
                                                <td>50,000원</td>
                                            </tr>
                                            <tr>
                                                <td>1,000,000~2,999,999원</td>
                                                <td>100,000원</td>
                                            </tr>
                                            <tr>
                                                <td>3,000,000~4,999,999원</td>
                                                <td>200,000원</td>
                                            </tr>
                                            <tr>
                                                <td>5,000,000~9,999,999원</td>
                                                <td>500,000원</td>
                                            </tr>
                                            <tr>
                                                <td>10,000,000~29,999,999원</td>
                                                <td>1,000,000원</td>
                                            </tr>
                                            <tr>
                                                <td>30,000,000~49,999,999원</td>
                                                <td>2,000,000원</td>
                                            </tr>
                                            <tr>
                                                <td>50,000,000~199,999,999원</td>
                                                <td>5,000,000원</td>
                                            </tr>
                                            <tr>
                                                <td>200,000,000~499,999,999원</td>
                                                <td>10,000,000원</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                </>)}
            </div>

        </>
    );
}

export default Auction;
