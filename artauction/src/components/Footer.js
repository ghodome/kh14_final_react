import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";


const Footer = () => {
    return (
        <div style={{ height: '33vh', display: 'flex', flexWrap: 'wrap' }}>
            {/* 왼쪽 상단 */}
            <div style={{ flex: '1 1 70%', backgroundColor: 'white', height: '50%' }}>
                <nav className="navbar navbar-expand" style={{ justifyContent: 'center', padding: 0, marginRight: '17cm', bottom: '1cm' }}>
                    <div className="container-fluid" style={{ padding: '0' }}>
                        <div className="collapse navbar-collapse" id="footer-menu" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <ul className="navbar-nav" style={{ textAlign: 'center', display: 'flex', gap: '0.5cm', fontSize: '13px', fontWeight: '500' }}>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/notice" style={{ textDecoration: 'none', color: 'black' }}>
                                        공지사항
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/faq" style={{ textDecoration: 'none', color: 'black' }}>
                                        FAQ
                                    </NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/work/list" style={{ textDecoration: 'none', color: 'black' }}>
                                        작품
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
                <div className='row'>
                    <div className='col' style={{ color: 'gray' }}>
                        <span style={{ marginLeft: '3cm', fontSize: '13px' }}><b>(주)</b>ArtAuction</span>
                        <span style={{ marginLeft: '0.3cm', fontSize: '13px' }}>조장 : 이재욱</span>
                        <span style={{ marginLeft: '0.3cm', fontSize: '13px' }}>주소:KH정보교육원</span>
                        <span style={{ marginLeft: '0.3cm', fontSize: '13px' }}>사업자번호:000-0000-000</span>
                    </div>

                    <div className='row'>
                        <div className='col' style={{ color: 'gray', fontSize: '13px' }}>
                            <span style={{ marginLeft: '3cm' }}>고객센터:00-000-0000</span>
                            <span style={{ marginLeft: '0.3cm' }}>사업자정보확인</span>
                        </div>
                    </div>
                </div>

                <div className='row'>
                    <div className='col' style={{ color: 'gray', fontSize: '13px' }}>
                        <span style={{ marginLeft: '3cm' }}>조원 : 박희우, 이용규, 최장현, 박우인, 노정현</span>
                    </div>
                </div>
            </div>

            {/* 오른쪽 상단 */}
            <div style={{ flex: '1 1 30%', backgroundColor: 'white', height: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <b
                    style={{
                        position: 'relative',
                        fontSize: '1.8rem',
                        color: 'black',
                        fontFamily: "'Dancing Script', cursive",
                        textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                        letterSpacing: '0.1em',
                        fontWeight: '300',
                        whiteSpace: 'nowrap',
                        zIndex: 1051,
                        maxWidth: 'calc(100% - 50px)',
                        textAlign: 'center',
                    }}
                >
                    Art Auction
                </b>
            </div>

            {/* 왼쪽 하단 */}
            <div style={{ flex: '1 1 70%', backgroundColor: '#fafafa', height: '50%' }}>
                <div className='row' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50%' }}>
                    <div className='col' style={{ display: 'flex', justifyContent: 'center', gap: '1cm', fontSize: '11px', marginRight: '13cm', marginTop: '0.5cm' }}>
                        <span>개인정보처리방침</span>
                        <span>경매약관</span>
                        <span>내부관리규정</span>
                        <span>윤리경영</span>
                    </div>
                    <div className='row'>
                        <div className='col' style={{ display: 'flex', fontSize: '11px', marginTop: '0.4cm', marginLeft: '95px' }}>
                            <span>(주)ArtAuction 매도인인 경우를 제외하고, 사이트상의 모든 상품 및 거래에 대하여 (주)ArtAuction은 통신판매중개자이며 통신판매의 당사자가 아닙니다. 따라서(주)ArtAuction은 상품·거래정보 및 거래에 대하여 책임을 지지 않습니다. ArtAuction 웹사이트의 콘텐츠(이미지/문자/영상/화면 등)에 대한 무단 복제, 배포, 전송, 게시, 크롤링/스크래핑 등 행위는 저작권법, 부정경쟁방지 및 영업비밀보호에 관한 법률 등 관련 법령에 의하여 금지됩니다.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 오른쪽 하단 */}
            <div style={{ flex: '1 1 30%', backgroundColor: '#fafafa', height: '50%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '2cm' }}>
                <div className='row' style={{ height: '80%' }}>
                    <div className='col' style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5cm', color: '#636e72', fontSize: '25px' }}>
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
