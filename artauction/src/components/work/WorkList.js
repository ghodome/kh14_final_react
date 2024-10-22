import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";

const WorkList = () => {

    //state
    const [workList, setWorkList] = useState([]);
    const [isEditing, setIsEditing] = useState(false); // 추가된 상태
    const [target, setTarget] = useState({
        artistNo: "",
        artistName: "",
        workTitle: "",
        workDescription: "",
        workMaterials: "",
        workSize: "",
        workCategory: "",
    });

    useEffect(() => {
        loadWorkList();
    }, []);

    const loadWorkList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/work/");
        setWorkList(resp.data);
    }, [workList]);
    // workList.filter(work => work.artistName === target.artistName).artistNo

    const editModal = useRef();
    const openEditModal = useCallback((work) => {
        setTarget({ ...work });
        setIsEditing(false); // 모달이 열릴 때는 편집 모드 해제
        const tag = Modal.getOrCreateInstance(editModal.current);
        tag.show();

    }, [editModal, target]);

    const closeEditModal = useCallback(() => {
        var tag = Modal.getInstance(editModal.current);
        tag.hide();

    }, [editModal])

    //삭제
    const deleteWork = useCallback(async (workNo) => {
        await axios.delete(`http://localhost:8080/work/${workNo}`);
        window.alert("삭제가 완료되었습니다.");
        loadWorkList();
        closeEditModal();
    }, []);

    // ----------------------------------------수정-------------------------------------------

    const changeTarget = useCallback(e => {
        setTarget({
            ...target,
            [e.target.name]: e.target.value
        });
    }, [target,workList]);

    const saveTarget = useCallback(async () => {
        const copy = { ...target };
        await axios.patch("http://localhost:8080/work/", copy);
        loadWorkList();
        closeEditModal();
    }, [target]);

    const toggleEditMode = () => {
        if (isEditing) {
            saveTarget();
        }
        setIsEditing(!isEditing);
    };
    

    // -------------------------------------------------------------------------------------------
    //view
    return (<>
        <div className="row mt-4">
            <div className="col-md-10 offset-md-1">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4">
                    {/* 카드 */}
                    {workList.map(work => (
                        <div className="col mb-3" key={work.workNo}>
                            <div className="card">
                                <h3 className="card-header">
                                    <img src="https://via.placeholder.com/300.jpg"
                                        className="card-img-top" />
                                </h3>
                                <div className="card-body">
                                    <h5 className="card-title">{work.workTitle}</h5>
                                    <h6 className="card-subtitle text-muted">{work.artistName}</h6>
                                    <div className="card-text text-muted mt-3">{work.workMaterials}</div>
                                    <div className="card-text text-muted">{work.workSize}</div>
                                </div>
                                <div className="card-body text-end">
                                    <button className="btn btn-outline-secondary" onClick={e => openEditModal(work)}>
                                        상세
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* 모달 */}
        <div className="modal fade" tabIndex="-1" ref={editModal}>
            <div className="modal-dialog">
                <div className="modal-content">
                    {/* 모달 헤더 */}
                    <div className="modal-header">
                        <h5 className="modal-title text-danger">작품 정보 상세</h5>
                        <button type="button" className="btn-close btn-manual-close" onClick={closeEditModal}></button>
                    </div>
                    {/* 모달 본문 */}
                    <div className="modal-body">
                        <div className="row mt-2">
                            <div className="col d-flex justify-content-center">
                                <img src="https://via.placeholder.com/300.jpg" className="card-img-top" style={{ width: 200 }} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작품명</label>
                                <input className="form-control" type="text" value={target.workTitle} disabled={!isEditing}
                                    name="workTitle" onChange={changeTarget} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작가명</label>
                                <input className="form-control" type="text" value={target.artistName} disabled={!isEditing}
                                    name="artistName" onChange={changeTarget} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작품 설명</label>
                                <input className="form-control" type="text" value={target.workDescription} disabled={!isEditing}
                                    name="workDescription" onChange={changeTarget} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>재료</label>
                                <input className="form-control" type="text" value={target.workMaterials} disabled={!isEditing}
                                    name="workMaterials" onChange={changeTarget} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>사이즈</label>
                                <input className="form-control" type="text" value={target.workSize} disabled={!isEditing}
                                    name="workSize" onChange={changeTarget} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>카테고리</label>
                                <select className="form-select" value={target.workCategory} disabled={!isEditing}
                                    name="workCategory" onChange={changeTarget}>
                                    <option value="">선택</option>
                                    <option>근현대</option>
                                    <option>아트</option>
                                    <option>고미술</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 모달 푸터 */}
                    <div className="modal-footer">
                        <div className="row">
                            <div className="col">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={e => deleteWork(target.workNo)}>
                                    삭제
                                </button>
                            </div>
                            <div className="col">
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={toggleEditMode}>
                                    {isEditing ? "수정완료" : "수정"}
                                </button>
                            </div>
                            <div className="col">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeEditModal}>
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </>);
};

export default WorkList;
