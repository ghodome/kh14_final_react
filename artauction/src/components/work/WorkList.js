import { useCallback, useEffect, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";

const WorkList = () => {

    //state
    const [workList, setWorkList] = useState([]);

    useEffect(() => {
        loadWorkList();
    }, []);

    const loadWorkList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/work/");
        setWorkList(resp.data);
    }, [workList]);

    //view
    return (<>

        <div className="row ">
            <div className="col">

                <div className="navbar-nav me-auto">
                    <div className="nav-item text-center">
                        <button type="button" className="btn ms-5">전체</button>
                        <button type="button" className="btn ms-5">근현대</button>
                        <button type="button" className="btn ms-5">아트</button>
                        <button type="button" className="btn ms-5">고미술</button>
                    </div>
                </div>
            </div>
        </div>

        <div className="row mt-4">
            <div className="col">
                <hr />
            </div>
        </div>


        <div className="row mt-4">
            <div className="col-md-10 offset-md-1">
                <div className="row mt-4">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4">

                        {/* 카드 */}
                        {workList.map(work => (

                            <div className="col mb-3" key={work.workNo}>
                                <div className="card">
                                    <h3 className="card-header">
                                        <img src="https://via.placeholder.com/300.jpg"
                                            className="card-img-top"/>
                                    </h3>

                                    <div className="card-body">
                                        <h5 className="card-title">{work.workTitle}</h5>
                                        <h6 className="card-subtitle text-muted">{work.artistNo}</h6>
                                    </div>

                                    <div className="card-body">

                                    </div>

                                    <ul className="list-group list-group-flush">
                                        <li className="list-group-item text-muted">{work.workMaterials}</li>
                                        <li className="list-group-item text-muted">{work.workSize}</li>
                                    </ul>

                                    <div className="card-body text-center">
                                        <button className="btn btn-success">
                                            서면/전화 응찰 신청
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </div>


    </>
    );
};

export default WorkList;
