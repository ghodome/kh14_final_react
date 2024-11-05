import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-title">Art Auction</div>
                <nav className="footer-nav">
                    <a href="#">회사소개</a>
                    <a href="#">IR 정보</a>
                    <a href="#">채용 공고</a>
                    <a href="#">언론 보도</a>
                    <a href="#">공지사항</a>
                    <a href="#">오시는길</a>
                </nav>
            </div>
            <div className="footer-middle">
                <div>사업자등록번호 101-86-17910 | 통신판매업신고번호 : 서울강남 제 2008-537호 | 대표이사 : 도현순</div>
                <div>주소 : 서울특별시 강남구 언주로 172길 23 이랜텍빌딩 | 대표전화 : 02-3479-8888 | 팩스 : 02-3479-8888</div>
                <div>케이옥션 사이트의 이미지 및 영상, 문서 등의 자료 또는 정보에 대한 무단복제, 전송, 배포, 크롤링/스크래핑 등의 행위는 저작권법, 부정경쟁방지 및 영업비밀보호에 관한 법률 등 관련 법령에 의하여 엄격히 금지됩니다.</div>
                <div>Copyright © K Auction. All Rights Reserved</div>
            </div>
            <div className="footer-bottom">
                <a href="#">이용약관</a>
                <a href="#">개인정보처리방침</a>
                <a href="#">내부정보관리규범</a>
                <a href="#">홈페이지 오류문의</a>
            </div>
        </footer>
    );
};

export default Footer;