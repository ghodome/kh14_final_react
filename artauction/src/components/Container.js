import Artist from "./Artist/Artist";
import ArtistRegist from "./Artist/ArtistRegist";
import Home from "./Home";
import Menu from "./Menu";
import WorkRegist from "./work/WorkRegist";
import {Routes, Route } from 'react-router-dom';

const Container =()=>{
    return (<>
        <div className="container-fluid">
            <div className="row">
                <div className="col my-5 pt-4 pt-sm-5">
                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/work" element={<WorkRegist/>}/>
                        <Route path="/artist" element={<Artist/>}/>
                        <Route path="/artist/regist" element={<ArtistRegist/>}/>
                    </Routes>
                </div>
            </div>
        </div>
    </>)
}

export default Container;