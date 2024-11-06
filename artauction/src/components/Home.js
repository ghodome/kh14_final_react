import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ImageSlider from "./ImageSlider";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { NavLink } from "react-router-dom";


const Home = () => {
    const [rankList, setRankList] = useState([]);
    const [workList, setWorkList] = useState([]);

    const [inputKeyword, setInputKeyword] = useState({
        column: "",
        keyword: "",
        beginRow: "",
        endRow: ""
    });

    const settings = {
        dots: false,
        infinite: false,
        slidesToShow: 2,
        slidesToScroll: 1,
        arrows: true, // 화살표 표시
    };

    const sendRankList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/deal/list");
        setRankList(resp.data);
    }, []);

    const sendWorkList = useCallback(async () => {
        const resp = await axios.post("http://localhost:8080/work/", inputKeyword);
        setWorkList(resp.data.workList);
    }, [workList, inputKeyword]);

    useEffect(() => {
        sendRankList();
        sendWorkList();
    }, []);

    //view
    return (<>

        <div className="mt-4">
            <ImageSlider />
        </div>

        <div className="row mt-4">
            <div className="col-6">
                <div className="d-flex justify-content-between align-items-center">
                    <h3>작품 목록</h3>
                    <NavLink className="nav-link me-3" to="/work/list" style={{ textDecoration: 'none', color: 'black', fontSize:12}}>
                        더보기
                    </NavLink>
                </div>
                <div className="slider-container" style={{ overflowX: 'scroll', whiteSpace: 'nowrap' }}>
                    {workList.map((work, index) => (
                        <div key={index} className="slide" style={{ display: 'inline-block', padding: '10px' }}>
                            <img
                                className="slide-image"
                                src={work.attachment ? `http://localhost:8080/attach/download/${work.attachment}` : "https://placehold.co/300x200"}
                                alt={`Image ${index + 1}`}
                                style={{ height: 250, width: '100%', objectFit: 'cover', objectPosition: 'center' }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-6">
                <ul className="navbar-nav me-auto">
                    <li className="nav-item dropdown">
                        <h3>최근 낙찰 물품</h3>
                    </li>

                    <li className="nav-item dropdown" >
                        <table className="table table-striped table-borderless">
                            <thead className="table-dark">
                                <tr>
                                    <th>작품명</th>
                                    <th>낙찰자</th>
                                    <th>낙찰가</th>
                                    <th>낙찰 일자</th>
                                    <th>작가명</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankList.length > 0 && rankList[0].dealNo > 0 ? (
                                    rankList.map(rank => (
                                        <tr key={rank.dealNo}>
                                            <td>{rank.workTitle}</td>
                                            <td>{rank.dealBuyer}</td>
                                            <td>{rank.dealPrice.toLocaleString()}원</td>
                                            <td>{rank.dealTime}일</td>
                                            <td>{rank.artistName}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">최근 낙찰 물품이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </li>
                </ul>
            </div>
        </div>
    </>)
}

export default Home;