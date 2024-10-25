import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import * as hangul from 'hangul-js';

const WorkList = () => {

    //state
    const [workList, setWorkList] = useState([]);
    const [images, setImages] = useState([]);
    const [isEditing, setIsEditing] = useState(false); // 추가된 상태
    const [target, setTarget] = useState({
        artistNo: "",
        artistName: "",
        workTitle: "",
        workDescription: "",
        workMaterials: "",
        workSize: "",
        workCategory: "",
        attachList:[],
    });
    const [inputKeyword, setInputKeyword] = useState({
        column : "",
        keyword : "",
        beginRow : "",
        endRow : ""
      });

    //navigate
    const navigate = useNavigate();

    const [artistList, setArtistList] = useState([

    ]);
    const [keyword, setKeyword] = useState("");
    const [open, setOpen] = useState(false);
    const [image,setImage]=useState();

    
    const loadArtistList = useCallback(async () => {
        const resp = await axios.get("http://localhost:8080/artist/");
        setArtistList(resp.data);
    }, [artistList]);

    const changeKeyword = useCallback(e => {
        setKeyword(e.target.value);
        setOpen(e.target.value.length > 0);
    }, [keyword]);

    const selectKeyword = useCallback(text => {
        setKeyword(text);
        setOpen(false);
    }, [keyword]);

    const searchResult = useMemo(() => {
        //키워드 결과 없으면 표시X
        if (keyword.length === 0) return [];

        //키워드 있으면 이름 비교
        return artistList.filter(artist => {
            if (hangul.search(artist.artistName, keyword) >= 0) {
                return true;
            }
            return false;
        });
    }, [keyword, artistList]);

    // ----------------------- 등록 -----------------------------
    const clearInput = useCallback(() => {
        setInput({
            workTitle: "",
            artistNo: "",
            workDescription: "",
            workMaterials: "",
            workSize: "",
            workCategory: "",
            attachList:[]
        });
    }, []);
    const [input, setInput] = useState({
        workTitle: "",
        artistNo: "",
        workDescription: "",
        workMaterials: "",
        workSize: "",
        workCategory: "",
        attachList:[]
    });

    //callback
    const changeInput = useCallback(e=>{
        if (e.target.type === "file") {
            const files = Array.from(e.target.files);
            setInput({
                ...input,
                attachList : files
            });
            // 이미지 미리보기
            const imageUrls = files.map(file => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                return new Promise((resolve) => {
                    reader.onloadend = () => {
                        resolve(reader.result); // 파일 읽기가 끝난 후 URL을 불러오기
                    };
                });
            });    
            Promise.all(imageUrls).then(urls => {
                setImages(urls); // 모든 이미지 URL을 상태에 저장
            });
        }
        else{
            setInput({
                ...input,
                [e.target.name] : e.target.value
            });
        }
    },[input]);

    const inputFileRef = useRef(null);


    const insertWork = useCallback(async() =>{
        const formData = new FormData();
    
        const fileList = inputFileRef.current.files;

        for(let i =0; i < fileList.length; i++) {
            formData.append("attachList", fileList[i]);
        }
        
        formData.append("workTitle", input.workTitle);
        formData.append("artistNo", input.artistNo);
        formData.append("workDescription", input.workDescription);
        formData.append("workMaterials", input.workMaterials);
        formData.append("workSize", input.workSize);
        formData.append("workCategory", input.workCategory);

        // 실제로 어떤 값이 전송되는지 로그 확인
        console.log("attachment:", input.attachList);

        await axios.post("http://localhost:8080/work/", formData,{
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        });
        inputFileRef.current.value = ""
        navigate("/work/list");
        clearInput();
        loadWorkList();
        closeInsertModal();
        setImages([]);
    });


    const insertModal = useRef();
    const openInsertModal = useCallback(() => {
        const tag = Modal.getOrCreateInstance(insertModal.current);
        tag.show();
    }, [insertModal]);

    const closeInsertModal = useCallback(() => {
        var tag = Modal.getInstance(insertModal.current);
        tag.hide();
        clearInput();//입력창 청소
        setImages([]);
    }, [insertModal]);

    //----------------------------------------------------------

    useEffect(() => {
        loadWorkList();
    }, []);

    const loadWorkList = useCallback(async () => {
        const resp = await axios.post("http://localhost:8080/work/",inputKeyword);
        console.log(resp.data);
        setWorkList(resp.data.workList);
    }, [workList,inputKeyword]);

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
    // 작가 번호 입력시 작가 이름 업데이트
    const changeArtistNo = useCallback((e) => {
        const value = e.target.value;
        setTarget({
            ...target,
            artistNo: value
        });
    }, [target]);

    // Blur 이벤트 시 작가 이름과 작품 정보를 동시에 확인
    const updateArtistBlur = useCallback(() => {
        // artistList에서 artistNo로 작가 찾기
        const selectedArtist = artistList.find(artist => String(artist.artistNo) === String(target.artistNo));

        if (selectedArtist) {
            // 작가 번호에 해당하는 작가가 있으면 작가 이름 설정
            setTarget(prevTarget => ({
                ...prevTarget,
                artistName: selectedArtist.artistName
            }));

            // workList에서 작가 이름과 작품 제목이 모두 일치하는 작품 찾기
            const findWork = workList.find(work =>
                work.artistName === selectedArtist.artistName &&
                work.workTitle === target.workTitle
            );

            if (findWork) {
                // 작품 정보가 있을 경우 해당 정보로 업데이트
                setTarget(prevTarget => ({
                    ...prevTarget,
                    workDescription: findWork.workDescription,
                    workMaterials: findWork.workMaterials,
                    workSize: findWork.workSize,
                    workCategory: findWork.workCategory
                }));
            }
        } else {
            // 작가 번호가 맞지 않으면 경고 메시지
            window.alert("해당 작가 번호를 찾을 수 없습니다.");
        }
    }, [artistList, workList, target.artistNo, target.workTitle]);

    const changeTarget = useCallback(e => {
        const { name, value } = e.target;

        if (name === 'artistNo') {
            const selectedArtist = artistList.find(artist => artist.artistNo === value);
            if (selectedArtist) {
                setTarget({
                    ...target,
                    artistNo: value,
                    artistName: selectedArtist.artistName // 작가명 자동 설정
                });
            } else {
                setTarget({
                    ...target,
                    artistNo: value,
                    artistName: "" // 해당 번호에 맞는 작가가 없을 경우 빈 값 설정
                });
            }
        } else {
            setTarget({
                ...target,
                [name]: value
            });
        }
    }, [target, artistList]);

    
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

    // const loadImageWork=useCallback(async ()=>{
    //     const resp=await axios.get("http://localhost:8080/180",{
    //         responseType: 'blob' // 이미지 데이터를 Blob으로 받기 위해 responseType 설정
    //     });
    //     const imageUrl = URL.createObjectURL(new Blob([resp.data])); // Blob 데이터를 이미지 URL로 변환
    //     setImage(imageUrl); // 변환한 URL을 state에 저장하여 렌더링

    // },[]);

    useEffect(() => {
        loadArtistList();
        // loadImageWork();
    }, []);




    //view
    return (<>
        <div className="row mt-5">
            <div className="col">
                <div className="form-group">
                    <input type="text" className="form-control"
                        placeholder="작가 이름"
                        value={keyword}
                        onChange={changeKeyword} />
                    {open === true && (
                        <ul className="list-group">
                            {searchResult.map(artist => {
                                return (
                                    <li key={artist.artistNo}
                                        className="list-group-item"
                                        onClick={e => selectKeyword(artist.artistName)}>
                                        {artist.artistNo}
                                        <span className="text-muted ms-4">{artist.artistName}</span>
                                        <span className="text-muted ms-4">{artist.artistBirth}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>


        <div className="row mt-4">
            <div className="col text-end">
                <button className="btn btn-primary" onClick={openInsertModal}>등록</button>
            </div>
        </div>

        <div className="row mt-2">
            <div className="col">
                <hr />
            </div>
        </div>

        <div className="row mt-4">
            <div className="col-md-10 offset-md-1">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-5">
                    {/* 카드 */}
                    {loadWorkList&&workList.map(work => (
                        <div className="col mb-3" key={work.workNo}>
                            <div className="card">
                                <h3 className="card-header">
                                <img src={`http://localhost:8080/attach/download/${work.attachment}`} className="card-img-top" />
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
                    {/* {workList.map(work => (  */}
                        <div className="row mt-2">
                            <div className="col d-flex justify-content-center">
                            {/* <img src={`http://localhost:8080/attach/download/${work.attachment}`} style={{ width: 200 }} /> */}
                            </div>
                        </div>
                    {/* ))} */}

                        <div className="row mt-2">
                            <div className="col">
                                <label>작품명</label>
                                <input className="form-control" type="text" value={target.workTitle} disabled={!isEditing}
                                    name="workTitle" onChange={changeTarget} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작가번호</label>
                                <input className="form-control"
                                    type="text"
                                    value={target.artistNo}
                                    disabled={!isEditing}
                                    name="artistNo"
                                    onChange={changeArtistNo}
                                    onBlur={updateArtistBlur} /> {/* 번호 입력 후 작가 이름과 작품 정보 확인 */}
                            </div>
                            <div className="col">
                                <label>작가명</label>
                                <input className="form-control"
                                    disabled
                                    type="text"
                                    value={target.artistName}
                                    readOnly /> {/* 작가명 자동 입력 */}
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

        {/* 등록 모달 */}
        <div className="modal fade" tabIndex="-1" ref={insertModal}>
            <div className="modal-dialog">
                <div className="modal-content">
                    {/* 모달 헤더 - 제목, x버튼 */}
                    <div className="modal-header">
                        <h5 className="modal-title text-danger">작품 정보 등록</h5>
                        <button type="button" className="btn-close btn-manual-close" onClick={closeInsertModal}></button>
                    </div>
                    {/* 모달 본문 */}
                    <div className="modal-body">
                        <div className="row mt-2">
                            <div className="col">
                            <label className="form-label">파일</label>
                                {/*  multiple accept -> 어떤 형식 받을건가*/}
                                <input type="file" className="form-control" name="attachList" multiple accept="image/*" onChange={changeInput} ref={inputFileRef}/>
                                {images.map((image, index) => (
                                    <img key={index} src={image} alt={`미리보기 ${index + 1}`} style={{ maxWidth: '100px', margin: '5px' }} />
                                ))}
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작품명</label>
                                <input type="text" className="form-control" name="workTitle"
                                    value={input.workTitle} onChange={changeInput} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작가번호</label>
                                <input type="text" className="form-control" name="artistNo"
                                    value={input.artistNo} onChange={changeInput} />
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작품설명</label>
                                <textarea className="form-control" id="exampleTextarea" rows="3"
                                    style={{ minHeight: '100px' }} name="workDescription"
                                    value={input.workDescription} onChange={changeInput}></textarea>
                            </div>
                        </div>

                        <div className="rorw mt-2">
                            <div className="col">
                                <label>작품재료</label>
                                <input type="text" className="form-control" name="workMaterials"
                                    value={input.workMaterials} onChange={changeInput} />
                            </div>
                        </div>

                        {/* Updated 작품크기 section */}
                        <div className="row mt-2">
                            <div className="col">
                                <label>작품크기</label>
                                <input type="text" className="form-control" placeholder="가로 X 세로" name="workSize"
                                    value={input.workSize} onChange={changeInput} />
                            </div>
                        </div>

                        <div className="rorw mt-2">
                            <div className="col">
                                <label>작품분류</label>
                                <select type="text" name="workCategory" className="form-select"
                                    value={input.workCategory} onChange={changeInput}>
                                    <option value="" className="text-muted">선택하세요</option>
                                    <option>근현대</option>
                                    <option>아트</option>
                                    <option>고미술</option>

                                </select>
                            </div>
                        </div>
                    </div>
                    {/* 모달 푸터 - 종료, 확인, 저장 등 각종 버튼 */}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={insertWork}>등록</button>
                        <button type="button" className="btn btn-secondary btn-manual-close" onClick={closeInsertModal}>닫기</button>
                    </div>
                </div>
            </div>
        </div>

    </>);
};

export default WorkList;