
import { useCallback, useState } from "react";
import Jumbotron from "./../Jumbotron";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const WorkRegist = () => {
    //navigate
    const navigate = useNavigate();

    //state
    const [input, setInput] = useState({
        workNo:"",
        workTitle:"",
        artistNo:"",
        workDescription:"",
        workMaterials:"",
        workSize:"",
        workCategory:""
    });

    //callback
    const changeInput = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    const insertWork = useCallback(async()=>{
        const resp = await axios.post("http://localhost:8080/work/",input);
        navigate("/work/list");
    }, [input]);

    //view
    return (<>
        <div className="row">
            <div className="col-md-4 offset-md-4">

                {/* <div className="rorw mt-4">
                    <div className="col">
                        <label>이미지</label>
                        <input type="file" className="form-control" id="image" accept="image/*" /> 
                    </div>
                </div> */}

                <div className="row mt-4">
                    <div className="col">
                        <label>작품명</label>
                        <input type="text" className="form-control" name="workTitle"
                                            value={input.workTitle} onChange={changeInput}/>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col">
                        <label>작가번호</label>
                        <input type="text" className="form-control" name="artistNo"
                                            value={input.artistNo} onChange={changeInput}/>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col">
                        <label>작품설명</label>
                        <textarea className="form-control" id="exampleTextarea" rows="3"
                                                style={{ minHeight: '100px' }} name="workDescription"
                                                value={input.workDescription} onChange={changeInput}></textarea>
                    </div>
                </div>

                <div className="rorw mt-4">
                    <div className="col">
                        <label>작품재료</label>
                        <input type="text" className="form-control" name="workMaterials"
                                    value={input.workMaterials} onChange={changeInput}/>
                    </div>
                </div>

                {/* Updated 작품크기 section */}
                <div className="row mt-4">
                    <div className="col">
                    <label>작품크기</label>
                        <input type="text" className="form-control" placeholder="가로 X 세로" name="workSize"
                                    value={input.workSize} onChange={changeInput}/>
                    </div>
                </div>

                <div className="rorw mt-4">
                    <div className="col">
                        <label>작품분류</label>
                        <select type="text" name="workCategory" className="form-select" 
                                    value={input.workCategory} onChange={changeInput}>
                            <option value="">선택하세요</option>
                            <option>근현대</option>
                            <option>아트</option>
                            <option>고미술</option>

                        </select>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col text-end">
                        <button type="button" className="btn btn-success" onClick={insertWork}>등록</button>
                        <button type="button" className="btn btn-secondary ms-2" onClick={e=> navigate("/work/list")}>목록</button>
                    </div>
                </div>

            </div>
        </div>
    </>)
}

export default WorkRegist;