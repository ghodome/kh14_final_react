import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";

const ArtistRegist = ()=>{
    function onChange(e) {
        const text=document.querySelector(".note-editable").textContent;
        console.log(text);
       e.preventDefault(); 
      };

    //state
    const [input, setInput]=useState({});
    const [artistList,setArtistList]=useState([]);

    //callback
    const changeInput = useCallback((e)=>{
        setInput({...input,
            [e.target.name]:e.target.value,
        })
    },[input]);

    const loadArtistList =useCallback(async ()=>{
        const resp=await axios.get("http://localhost:8080/artist/");
        setArtistList(resp.data);
    },[artistList]);

    //effect
    useEffect(()=>{
        loadArtistList();
    },[])
    return (<>
        <Jumbotron title="작가 목록"></Jumbotron>
        <div className="row">
            <div className="col">
                <div className="modal-body">
                    <div className="input-group">
                        <label className="form-check-label">작가</label>
                        <input className="form-control"
                            name="artistName" value={input.artistName}
                            onChange={e=>changeInput(e)}></input>
                    </div>
                </div>
            </div>
        </div>
        <div className="row">
            <div className="col">
                <ul className="list-group list-group-flush">
                    {artistList.map(artist=>(
                        <div key={artist.artistNo}>
                            <div className="row mt-2">
                                <div className="col-4">
                                    <li className="list-group-item">{artist.artistNo}</li>
                                </div>
                                <div className="col-4">
                                    <li className="list-group-item">{artist.artistName}</li>
                                </div>
                                <div className="col-4">
                                    <li className="list-group-item">{artist.artistBirth} ~ {artist.artistDeath}</li>
                                </div>
                            </div>
                        </div>
                    ))}
                </ul>
            </div>
        </div>
    </>)
}

export default ArtistRegist;