import React, { useCallback, useEffect, useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './ImageSlider.css';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/ko';
import { useNavigate } from 'react-router-dom';
moment.locale('ko');

const ImageSlider = () => {
    //navigator 
    const navigate = useNavigate(); 

    //state
    const [auctionScheduleList, setAuctionScheduleList] = useState([]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 2000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 8000, // 15초마다 자동 전환
        pauseOnHover: true,
        arrows: false, // 화살표 숨김
    };

    // 경매 일정 목록 불러오기
    const loadAuctionScheduleList = useCallback(async () => {

        try {
            const resp = await axios.post("http://localhost:8080/auctionSchedule/home", {

            });
            const list = resp.data.auctionScheduleList;
             // 종료경매가 아닌 일정만 필터링
            const filteredList = list.filter(schedule => schedule.auctionScheduleState !== '종료경매');
            
            setAuctionScheduleList(filteredList);
        } catch (error) {
            console.error("Error loading auction schedule list:", error);
        }
    }, []);

    useEffect(() => {
        loadAuctionScheduleList();
    }, []);

    return (
        <div className="slider-container">
            <Slider {...settings}>
                {auctionScheduleList.map((schedule, index) => (
                    <div key={index} className="slide">
                        <img className="slide-image" src={schedule.attachment ? `http://localhost:8080/attach/download/${schedule.attachment}` : "https://placehold.co/300x200"} alt={`Image ${index + 1}`}
                            style={{ height: 250, width: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                        <div className="text-overlay">
                            <h2>{schedule.auctionScheduleTitle}</h2>
                            <div>{schedule.auctionScheduleNotice}</div>
                            <div>경매 시작일: {moment(schedule.auctionScheduleStartDate).format("yyyy/MM/DD (dd) a hh:mm")}</div>
                            <div>경매 종료일: {moment(schedule.auctionScheduleEndDate).format("yyyy/MM/DD (dd) a hh:mm")}</div>
                            {schedule.auctionScheduleState === '예정경매' && (
                            <button className="btn btn-secondary"
                                        onClick={e=>navigate("/auctionschedule/detail/"+schedule.auctionScheduleNo)}>예정경매</button>
                            )}
                            {schedule.auctionScheduleState === '진행경매' &&(
                                <button className="btn btn-secondary"
                                    onClick={e=>navigate("/auctionList/"+schedule.auctionScheduleNo)}>경매참여</button>
                            )}
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default ImageSlider;