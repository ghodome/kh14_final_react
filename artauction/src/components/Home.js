import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { NavLink } from "react-router-dom";
import ImageSlider from './ImageSlider';
import { Modal } from "bootstrap";
import Cookies from "js-cookie"; //라이브러리 추가

const Home = () => {
    const [rankList, setRankList] = useState([]);
    const [workList, setWorkList] = useState([]);
    const [inputKeyword, setInputKeyword] = useState({
        column: "",
        keyword: "",
        beginRow: "",
        endRow: ""
    });

    const listModalRef = useRef();

    // 커스텀 화살표 컴포넌트
    const Arrow = ({ className, onClick, direction }) => (
        <button
            className={className}
            onClick={onClick}
            style={{
                position: 'absolute',
                top: '50%',
                [direction]: '10px',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                zIndex: 1,
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
            }}
        >
        </button>
    );

    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 4, // 한 번에 보여줄 슬라이드 개수
        slidesToScroll: 4,
        responsive: [
            { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 3 } },
            { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } }
        ],
        prevArrow: <Arrow direction="left" />,  // 왼쪽 화살표
        nextArrow: <Arrow direction="right" />, // 오른쪽 화살표
    };

    const sendRankList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/deal/list");
        setRankList(resp.data);
    }, []);

    const sendWorkList = useCallback(async () => {
        const resp = await axios.post("http://localhost:8080/work/", inputKeyword);
        setWorkList(resp.data.workList);
    }, [inputKeyword]);

    useEffect(() => {
        sendRankList();
        sendWorkList();
        // 쿠키 사용: 'hasSeenModal' 쿠키를 확인하여 모달을 표시할지 여부를 결정
        const hasSeenModal = Cookies.get("hasSeenModal");

        if (!hasSeenModal) {
            const modal = Modal.getOrCreateInstance(listModalRef.current);
            modal.show();
        }
    }, []);
    // "오늘은 그만 보기" 버튼 클릭 시 쿠키 설정
    const handleCloseModal = () => {
        Cookies.set("hasSeenModal", "true", { expires: 1 });

        const modal = Modal.getInstance(listModalRef.current);
        modal.hide();
    };

    // 모달 닫기
    const closeListModal = () => {
        const modal = Modal.getInstance(listModalRef.current);
        modal.hide();
    };


    return (
        <>
            <div className="mt-4">
                <ImageSlider />
            </div>

            <div className="mt-4">
                <h3>작품 목록</h3>
                <Slider {...settings}>
                    {workList.map((work, index) => (
                        <div key={index} className="p-2">
                            <div className="card h-100">
                                <img
                                    className="card-img-top"
                                    src={work.attachment ? `http://localhost:8080/attach/download/${work.attachment}` : "https://placehold.co/300x200"}
                                    alt={`Image ${index + 1}`}
                                    style={{ height: 300, objectFit: 'cover', objectPosition: 'center' }}
                                />
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>

            {/* 최근 낙찰 물품 모달 변경 부분 */}
            <div className="modal fade" tabIndex="-1" ref={listModalRef}>
                <div
                    className="modal-dialog"
                    style={{
                        position: "fixed",
                        top: "20%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        maxWidth: "50%",
                        width: "50%",
                        margin: 0,
                        height: "70%",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">전체 최근 낙찰 물품</h5>
                            <button type="button" className="btn-close" onClick={closeListModal} />
                        </div>
                        <div className="modal-body">
                            <div className="table-responsive">
                                <table className="table" style={{ backgroundColor: 'white', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead style={{ backgroundColor: '#f8f9fa', color: '#495057', fontWeight: 'bold', textAlign: 'center' }}>
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
                                            rankList.map((rank) => (
                                                <tr key={rank.dealNo} style={{ textAlign: 'center' }}>
                                                    <td>{rank.workTitle}</td>
                                                    <td>{rank.dealBuyer}</td>
                                                    <td>{rank.dealPrice.toLocaleString()}원</td>
                                                    <td>{rank.dealTime}일</td>
                                                    <td>{rank.artistName}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center" style={{ padding: "20px 0", color: "#6c757d" }}>
                                                    최근 낙찰 물품이 없습니다.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleCloseModal}
                                style={{
                                    padding: '10px 20px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    borderRadius: '20px',
                                    backgroundColor: 'white',
                                    color: 'black',
                                    float: 'right',
                                }}
                                onMouseEnter={(e) => e.target.style.fontWeight = 'bold'}
                                onMouseLeave={(e) => e.target.style.fontWeight = 'normal'}
                            >
                                오늘은 그만 보기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
