import React from 'react';
import { NavLink } from 'react-router-dom'; // NavLink 임포트
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";

const Footer = () => {
    return (
        <div
            className="container-fluid"
            style={{
                width: '100%',
                height: '33.33vh', // 전체 높이를 화면 크기의 3분의 1로 설정
                backgroundColor: '#f8f9fa',
                paddingTop: '10px',
                paddingBottom: '10px',
                marginTop: 'auto', // 푸터를 아래로 밀어주기
                backgroundColor: 'white',
                marginTop: '10px',
            }}
        >
            <div className="row" style={{ height: '100%', flexDirection: 'column' }}>
                {/* 상단 영역 (3:10 비율 -> 3/10) */}
                <div
                    className="col"
                    style={{
                        padding: '10px',
                        textAlign: 'center',
                        borderBottom: '1px solid #ddd',
                        height: '30%',
                        position: 'relative',
                        borderBottom: 'none',
                        paddingBottom: '20px',
                    }}
                >
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            position: 'absolute',
                            left: '5%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '14px',
                            fontWeight: '500',
                            borderBottom: 'none',
                        }}
                        
                    >
                        <li style={{ display: 'inline', marginRight: '20px' }}>
                            <NavLink to="/notice" style={{ textDecoration: 'none', color: 'black' }}>
                                공지사항
                            </NavLink>
                        </li>
                        <li style={{ display: 'inline', marginRight: '20px' }}>
                            <NavLink to="/faq" style={{ textDecoration: 'none', color: 'black' }}>
                                FAQ
                            </NavLink>
                        </li>
                        <li style={{ display: 'inline', marginRight: '20px' }}>
                            <NavLink to="/work/list" style={{ textDecoration: 'none', color: 'black' }}>
                                작품
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* 중단 영역 (3:10 비율 -> 3/10) */}
                <div
                    className="col"
                    style={{
                        padding: '10px',
                        textAlign: 'center',
                        borderBottom: '1px solid #ddd',
                        height: '30%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: 'none',
                    }}
                >
                    <div style={{ color: 'gray', fontSize: '13px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <span style={{ marginLeft: '1.2cm', fontSize: '13px' }}>
                                <b>(주)</b>ArtAuction
                            </span>
                            <span style={{ marginLeft: '0.5cm', fontSize: '13px' }}>조장 : 이재욱</span>
                            <span style={{ marginLeft: '0.5cm', fontSize: '13px' }}>주소: KH정보교육원</span>
                            <span style={{ marginLeft: '0.5cm', fontSize: '13px' }}>사업자번호: 000-0000-000</span>
                            <br />
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <span style={{ marginLeft: '1.2cm', fontSize: '13px' }}>고객센터:00-000-0000</span>
                            <span style={{ marginLeft: '0.5cm', fontSize: '13px' }}>사업자정보확인</span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <span style={{ marginLeft: '1.2cm', fontSize: '13px' }}>조원 : 박희우, 이용규, 최장현, 박우인, 노정현</span>
                        </div>
                    </div>

                    <b
                        style={{
                            fontSize: '1.8rem',
                            zIndex: 1051,
                            color: 'black',
                            fontFamily: "'Dancing Script', cursive",
                            letterSpacing: '0.1em',
                            fontWeight: '300',
                            whiteSpace: 'nowrap',
                            padding: '5px',
                            borderRadius: '5px',
                            marginLeft: '1cm',
                            marginRight: '5cm',
                        }}
                    >
                        Art Auction
                    </b>
                </div>

                {/* 하단 영역 (4:10 비율 -> 4/10) */}
                <div
                    className="col"
                    style={{
                        padding: '10px',
                        textAlign: 'center',
                        borderBottom: '1px solid #ddd',
                        height: '40%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: '#fafafa',
                    }}
                >
                    <div style={{ color: 'gray', fontSize: '13px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <span style={{ marginLeft: '1.2cm', fontSize: '13px' }}>개인정보처리방침</span>
                            <span style={{ marginLeft: '0.5cm', fontSize: '13px' }}>경매약관</span>
                            <span style={{ marginLeft: '0.5cm', fontSize: '13px' }}>내부관리규정</span>
                            <span style={{ marginLeft: '0.5cm', fontSize: '13px' }}>윤리경영</span>
                            <br />
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <span style={{ marginLeft: '1.2cm', fontSize: '13px' }}>
                                (주)ArtAuction 매도인인 경우를 제외하고, 사이트상의 모든 상품 및 거래에 대하여 (주)ArtAuction은 통신판매중개자이며 통신판매의 당사자가 아닙니다.
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <span style={{ marginLeft: '1.2cm', fontSize: '13px' }}>
                                따라서(주)ArtAuction은 상품·거래정보 및 거래에 대하여 책임을 지지 않습니다.
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            <span style={{ marginLeft: '1.2cm', fontSize: '13px' }}>
                                ArtAuction 웹사이트의 콘텐츠(이미지/문자/영상/화면 등)에 대한 무단 복제, 배포, 전송, 게시, 크롤링/스크래핑 등 행위는 저작권법, 부정경쟁방지 및 영업비밀보호에 관한 법률 등 관련 법령에 의하여 금지됩니다.
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5cm', color: '#636e72', fontSize: '25px', marginRight: '2cm' }}>
                        <span><RiKakaoTalkFill /></span>
                        <span><FaYoutube /></span>
                        <span><FaInstagram /></span>
                        <span><FaFacebook /></span>
                        <span><FaTwitter /></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Footer;
