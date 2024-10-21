import { NavLink } from "react-router-dom";

const Menu = ()=>{
    return(<>
        <nav className="navbar navbar-expand-lg bg-light fixed-top" data-bs-theme="light">
            <div className="container-fluid">
                <div className="collapse navbar-collapse" id="top-menu">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/member/join">회원가입</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/artist">작가</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/work/list">작품</NavLink>
                        </li> 
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/work/regist">작품등록</NavLink>
                        </li> 
                    </ul>
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/notice">공지사항</NavLink>
                        </li> 
                    </ul>
                </div>
            </div>
        </nav>
    </>)
}

export default Menu;