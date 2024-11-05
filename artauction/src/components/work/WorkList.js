import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { useNavigate } from "react-router-dom";
import * as hangul from 'hangul-js';
import Artist from './../Artist/Artist';
import { MdCancel } from "react-icons/md";
import Jumbotron from "../Jumbotron";

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
        attachList: [],
        attachment: ""
    });
    const [inputKeyword, setInputKeyword] = useState({
        column: "",
        keyword: "",
        beginRow: "",
        endRow: ""
    });
    const [collapse, setCollapse] = useState({
        work: false,
        modern: false,
        art: false,
        ancient: false,
        workButton: "btn",
        modernButton: "btn",
        artButton: "btn",
        ancientButton: "btn"
    });

    //navigate
    const navigate = useNavigate();

    const [artistList, setArtistList] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState();
    //페이지
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [modernList, setModernList] = useState([]);
    const [artList, setArtList] = useState([]);
    const [ancientList, setAncientList] = useState([]);

    const loadArtistList = useCallback(async () => {
        const resp = await axios.post("http://localhost:8080/artist/", inputKeyword);
        setArtistList(resp.data.artistList);
    }, [artistList,inputKeyword]);

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

    useEffect(()=>{
        loadArtistList();
    }, []);

    const clearInput = useCallback(() => {
        setInput({
            workTitle: "",
            artistNo: "",
            workDescription: "",
            workMaterials: "",
            workSize: "",
            workCategory: "",
            attachList: []
        });
    }, []);
    const [input, setInput] = useState({
        workTitle: "",
        artistNo: "",
        workDescription: "",
        workMaterials: "",
        workSize: "",
        workCategory: "",
        attachList: []
    });

    //callback
    const changeInput = useCallback(e => {
        if (e.target.type === "file") {
            const files = Array.from(e.target.files);
            setInput({
                ...input,
                attachList: files
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
        else {
            setInput({
                ...input,
                [e.target.name]: e.target.value
            });
        }
    }, [input]);

    const inputFileRef = useRef(null);


    const insertWork = useCallback(async () => {
        const formData = new FormData();

        const fileList = inputFileRef.current.files;

        for (let i = 0; i < fileList.length; i++) {
            formData.append("attachList", fileList[i]);
        }

        formData.append("workTitle", input.workTitle);
        formData.append("artistNo", input.artistNo);
        formData.append("workDescription", input.workDescription);
        formData.append("workMaterials", input.workMaterials);
        formData.append("workSize", input.workSize);
        formData.append("workCategory", input.workCategory);

        await axios.post("http://localhost:8080/work/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        inputFileRef.current.value = ""
        navigate("/work/list");
        clearInput();
        clearState();
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

    useEffect(() => {
        setCollapse({
            work: true,
            modern: false,
            art: false,
            ancient: false,
            workButton: "btn border-warning text-warning",
            modernButton: "btn",
            artButton: "btn",
            ancientButton: "btn"
        });
    }, []);

    const loadWorkList = useCallback(async () => {
        const resp = await axios.post("http://localhost:8080/work/", inputKeyword);
        setWorkList(resp.data.workList);

        setModernList(
            (resp.data.workList).filter(work => work.workCategory === '근현대')
        );
        setArtList(
            (resp.data.workList).filter(work => work.workCategory === '아트')
        );
        setAncientList(
            (resp.data.workList).filter(work => work.workCategory === '고미술')
        );
    }, [workList, inputKeyword]);

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
        setAttachImages([]); // 미리보기 이미지 초기화
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
        }
    }, [artistList, workList, target.artistNo, target.workTitle]);

    const changeTarget = useCallback(e => {
        const { name, value } = e.target;
        if(e.target.type === "file") {
            const files = Array.from(e.target.files);
            setInput(prevInput =>({
                ...prevInput,
                attachList: files
            }));
            const imageUrls = files.map(file=>{
                const reader =new FileReader();
                reader.readAsDataURL(file);
                return new Promise ((resolve) => {
                    reader.onloadend = () =>{
                        resolve(reader.result);
                    };
                });
            });
            Promise.all(imageUrls).then(urls => {
                setAttachImages(urls);
            });
        }
        else{
            setInput(prevInput => ({
                ...prevInput,
                product: {
                    ...prevInput.work,
                    [e.target.name] : e.target.value
                }
            }));
        }

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

    const [loadImages, setLoadImages] = useState([]);
    const [deleteList, setDeleteList] = useState([]);
    const [attachImages, setAttachImages] = useState([]);//보낼 추가첨부사진이미지
    const [workFileClass, setWorkFileClass] = useState("");
    const [workFileValid, setWorkFileValid] = useState(true);

    // const saveTarget = useCallback(async () => {
    //     const formData = new FormData();
    //     const fileList = inputFileRef.current.files;

    //     for (let i = 0; i < fileList.length; i++) {
    //         formData.append("attachList", fileList[i]);
    //     }

    //     formData.append("workTitle", target.workTitle);
    //     formData.append("artistNo", target.artistNo);
    //     formData.append("workDescription", target.workDescription);
    //     formData.append("workMaterials", target.workMaterials);
    //     formData.append("workSize", target.workSize);
    //     formData.append("workCategory", target.workCategory);
    //     formData.append("workNo", target.workNo);

    //     formData.append("originList", target.attachment); // 삭제 하지 않을 그림들의 첨부파일번호(attachmentNo) - target.attachment / loadImages

    //     await axios.post("http://localhost:8080/work/edit", formData, {
    //         headers: {
    //             'Content-Type': 'multipart/form-data',
    //         },
    //     });

    //     setImage(loadImages);

    //     closeEditModal();
    //     loadWorkList();
    // }, [target, loadImages]);

    const saveTarget = useCallback(async () => {
        const formData = new FormData();
        const fileList = inputFileRef.current.files;
    
        for (let i = 0; i < fileList.length; i++) {
            formData.append("attachList", fileList[i]);
        }
    
        formData.append("workTitle", target.workTitle);
        formData.append("artistNo", target.artistNo);
        formData.append("workDescription", target.workDescription);
        formData.append("workMaterials", target.workMaterials);
        formData.append("workSize", target.workSize);
        formData.append("workCategory", target.workCategory);
        formData.append("workNo", target.workNo);
    
        // 이미지가 새로 첨부된 경우 loadImages를, 그렇지 않다면 target.attachment를 사용
        if (fileList.length > 0) {
            formData.append("originList", loadImages); // 새로 첨부된 파일이 있는 경우
        } else {
            formData.append("originList", target.attachment); // 첨부된 파일이 없는 경우 기존 목록 유지
        }
    
        await axios.post("http://localhost:8080/work/edit", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    
        setImage(fileList.length > 0 ? loadImages : target.attachment); // 이미지 목록 업데이트
    
        closeEditModal();
        loadWorkList();
    }, [target, loadImages]);

    const deleteImage = useCallback((img) => {
        setDeleteList(img);
        setLoadImages(image => image.filter(image => image !== img));
    }, [deleteList, loadImages]);

    const deleteAttachImage = useCallback((img) => {
        //이미지 미리보기에서 삭제
        setAttachImages(prevImages => prevImages.filter(image => image !== img));
    }, []);

    const checkWorkFile = useCallback(() => {
        const valid = target.attachList > 0;
        setWorkFileValid(valid);
        if (target.attachList === 0) setWorkFileClass("");
        else setWorkFileClass(valid ? "is-valid" : "is-invalid");
    }, [target]);

    const toggleEditMode = () => {
        if (isEditing) {
            saveTarget();
        }
        setIsEditing(!isEditing);
    };

    const pageClick = useCallback((pageNumber) => {
        setPage(pageNumber);
    }, []);

    const sortedWorkList = [...workList].sort();
    const sortedModernList = [...modernList].sort();
    const sortedArtList = [...artList].sort();
    const sortedAncientList = [...ancientList].sort();

    const totalWork = Math.ceil(sortedWorkList.length / pageSize);
    const totalModern = Math.ceil(sortedModernList.length / pageSize);
    const totalArt = Math.ceil(sortedArtList.length / pageSize);
    const totalAcient = Math.ceil(sortedAncientList.length / pageSize);

    //작품 페이지
    const pageWork = useCallback(() => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return sortedWorkList.slice(startIndex, endIndex);
    }, [sortedWorkList, collapse]);

    //근현대 페이지
    const pageModern = useCallback(() => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return sortedModernList.slice(startIndex, endIndex);
    }, [sortedModernList, collapse]);

    //아트 페이지
    const pageArt = useCallback(() => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return sortedArtList.slice(startIndex, endIndex);
    }, [sortedArtList, collapse]);

    //고미술 페이지
    const pageAncient = useCallback(() => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return sortedAncientList.slice(startIndex, endIndex);
    }, [sortedAncientList, collapse]);

    //카테고리
    const clearCollapse = useCallback(() => {
        setCollapse({
            work: false,
            modern: false,
            art: false,
            ancient: false,
            workButton: "btn",
            modernButton: "btn",
            artButton: "btn",
            ancientButton: "btn"
        });
    }, [collapse]);

    const changeCollapse = useCallback((e) => {
        clearCollapse();
        setCollapse({
            ...collapse,
            [e.target.name]: true,
            [e.target.name + "Button"]: "btn border-warning text-warning"
        })
    }, []);

    //--------------등록 형식 검사-------------------
    const [workTitleValid, setWorkTitleValid] = useState(false);
    const [workfileValid, setWorkfileValid] = useState(false);
    const [artistNoValid, setArtistNoValid] = useState(false);
    const [workDescriptionValid, setWorkDescriptionValid] = useState(false);
    const [workMaterialsValid, setWorkMaterialsValid] = useState(false);
    const [workSizeValid, setWorkSizeValid] = useState(false);
    const [workCategoryValid, setWorkCategoryValid] = useState(false);

    const [workTitleClass, setWorkTitleClass] = useState("");
    const [workfileClass, setWorkfileClass] = useState("");
    const [artistNoClass, setArtistNoClass] = useState("");
    const [workDescriptionClass, setWorkDescriptionClass] = useState("");
    const [workMaterialsClass, setWorkMaterialsClass] = useState("");
    const [workSizeClass, setWorkSizeClass] = useState("");
    const [workCategoryClass, setWorkCategoryClass] = useState("");

    const checkWorkfile = useCallback(()=> {
        const valid = input.attachList.length > 0 ;
        setWorkfileValid(valid);
        if(input.attachList.length === 0) setWorkFileClass("");
        else setWorkfileClass(valid ? "is-valid" : "is-invalid");
    }, [input]);

    const checkWorkTitle = useCallback(()=>{
        const regex = /^.+$/;
        const valid = regex.test(input.workTitle);
        setWorkTitleValid(valid);
        if(input.workTitle.length === 0) setWorkTitleClass("");
        else setWorkTitleClass(valid ? "is-valid" : "is-invalid");
    }, [input]);

    const checkArtistNo = useCallback(()=> {
        const regex = /^.+$/;
        const valid = regex.test(input.artistNo);
        setArtistNoValid(valid);
        if(input.artistNo.length === 0) setArtistNoClass();
        else setArtistNoClass(valid ? "is-valid" : "is-inValid");
    }, [input]);

    const checkWorkDescription = useCallback(()=> {
        const regex = /^.+$/;
        const valid =  regex.test(input.workDescription);
        setWorkDescriptionValid(valid);
        if(input.workDescription.length === 0) setWorkDescriptionClass("");
        else setWorkDescriptionClass(valid ? "is-valid" : "is-inValid");
    }, [input]);

    const checkWorkMaterials = useCallback(()=>{
        const regex = /^.+$/;
        const valid = regex.test(input.workMaterials);
        setWorkMaterialsValid(valid);
        if(input.workMaterials.length === 0) setWorkMaterialsClass("");
        else setWorkMaterialsClass(valid ? "is-valid" : "is-inValid");
    }, [input]);

    const checkWorkSize = useCallback(()=>{
        const regex = /^.+$/;
        const valid = regex.test(input.workSize);
        setWorkSizeValid(valid);
        if(input.workSize.length === 0) setWorkSizeClass("");
        else setWorkSizeClass(valid ? "is-valid" : "is-inValid");
    }, [input]);

    const checkWorkCategory = useCallback(()=> {
        const regex = /^(근현대|아트|고미술)$/;
        const valid = regex.test(input.workCategory);
        setWorkCategoryValid(valid);
        if(input.workCategory.length === 0) setWorkCategoryClass("");
        else setWorkCategoryClass(valid ? "is-valid" : "is-inValid");
    }, [input]);

    const isAllValid = useMemo(()=> {
        return workTitleValid && workfileValid && artistNoValid && workDescriptionValid
                             && workMaterialsValid && workSizeValid && workCategoryValid;
    }, [workTitleValid, workfileValid, artistNoValid, workDescriptionValid, workMaterialsValid, workSizeValid, workCategoryValid]);

    const clearState = useCallback(() => {
        setWorkTitleValid(false);
        setWorkfileValid(false);
        setArtistNoValid(false);
        setWorkDescriptionValid(false);
        setWorkMaterialsValid(false);
        setWorkSizeValid(false);
        setWorkCategoryValid(false);
    
        setWorkTitleClass("");
        setWorkfileClass("");
        setArtistNoClass("");
        setWorkDescriptionClass("");
        setWorkMaterialsClass("");
        setWorkSizeClass("");
        setWorkCategoryClass("");
    }, []);
    

    //view
    return (<>
        {/* <div className="row mt-5">
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
        </div> */}

        <Jumbotron title="작품 리스트" />

        <div className="row mt-4 text-center">
            <div className="col-2 offset-2">
                <button className={collapse.workButton} name="work" onClick={changeCollapse}>전체</button>
            </div>
            <div className="col-2">
                <button className={collapse.modernButton} name="modern" onClick={changeCollapse}>근현대</button>
            </div>
            <div className="col-2">
                <button className={collapse.artButton} name="art" onClick={changeCollapse}>아트</button>
            </div>
            <div className="col-2">
                <button className={collapse.ancientButton} name="ancient" onClick={changeCollapse}>고미술</button>
            </div>
        </div>

        <div className="row mt-2">
            <div className="col">
                <hr />
            </div>
        </div>

        <div className="row mt-1">
            <div className="col text-start">

            </div>
            <div className="col text-end">
                <button className="btn btn-primary" onClick={openInsertModal}>등록</button>
            </div>
        </div>


        {collapse.work === true && (<>
            <div className="row text-end fw-bold">
                <div className="col-10 offset-1">
                    <div>검색결과 ({workList.length})</div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-10 offset-md-1">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                        {/* 카드 */}
                        {loadWorkList && pageWork().map(work => (
                            <div className="col mb-3" key={work.workNo}>
                                <div className="card h-100 d-flex flex-column">
                                    <h3 className="card-header" style={{ height: '200px', overflow: 'hidden' }}>
                                        <img src={`http://localhost:8080/attach/download/${work.attachment}`}
                                            className="card-img-top"
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                    </h3>
                                    <div className="card-body flex-grow-1">
                                        <h5 className="card-title">{work.workTitle}</h5>
                                        <h6 className="card-subtitle text-muted">{work.artistName}</h6>
                                        <div className="card-text text-muted mt-3">{work.workMaterials}</div>
                                        <div className="card-text text-muted">{work.workSize}</div>
                                    </div>
                                    <div className="card-body text-end">
                                        <button className="btn btn-outline-success" onClick={e => openEditModal(work)}>
                                            상세
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col">
                    <hr />
                </div>
            </div>

            {/* 페이지네이션 버튼 추가 */}
            <div className="row mt-4">
                <div className="col text-center">

                    {/* 페이지 번호 표시 */}
                    {[...Array(totalWork)].map((_, index) => (
                        <button
                            key={index}
                            className={`btn btn-outline-primary mx-1 ${page === index + 1 ? 'active' : ''}`}
                            onClick={() => pageClick(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                </div>
            </div>
        </>)}

        {collapse.modern === true && (<>
            <div className="row text-end fw-bold">
                <div className="col-10 offset-1">
                    <div>검색결과 ({modernList.length})</div>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-md-10 offset-md-1">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-5">
                        {/* 카드 */}
                        {pageModern().map(work => (
                            <div className="col mb-3" key={work.workNo}>
                                <div className="card h-100 d-flex flex-column">
                                    <h3 className="card-header" style={{ height: '200px', overflow: 'hidden' }}>
                                        <img src={`http://localhost:8080/attach/download/${work.attachment}`}
                                            className="card-img-top"
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                    </h3>
                                    <div className="card-body flex-grow-1">
                                        <h5 className="card-title">{work.workTitle}</h5>
                                        <h6 className="card-subtitle text-muted">{work.artistName}</h6>
                                        <div className="card-text text-muted mt-3">{work.workMaterials}</div>
                                        <div className="card-text text-muted">{work.workSize}</div>
                                    </div>
                                    <div className="card-body text-end">
                                        <button className="btn btn-outline-success" onClick={e => openEditModal(work)}>
                                            상세
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col">
                    <hr />
                </div>
            </div>

            {/* 페이지네이션 버튼 추가 */}
            <div className="row mt-4">
                <div className="col text-center">

                    {/* 페이지 번호 표시 */}
                    {[...Array(totalModern)].map((_, index) => (
                        <button
                            key={index}
                            className={`btn btn-outline-primary mx-1 ${page === index + 1 ? 'active' : ''}`}
                            onClick={() => pageClick(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                </div>
            </div>
        </>)}

        {collapse.art === true && (<>
            <div className="row text-end fw-bold">
                <div className="col-10 offset-1">
                    <div>검색결과 ({artList.length})</div>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-md-10 offset-md-1">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-5">
                        {/* 카드 */}
                        {pageArt().map(work => (
                            <div className="col mb-3" key={work.workNo}>
                                <div className="card h-100 d-flex flex-column">
                                    <h3 className="card-header" style={{ height: '200px', overflow: 'hidden' }}>
                                        <img src={`http://localhost:8080/attach/download/${work.attachment}`}
                                            className="card-img-top"
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                    </h3>
                                    <div className="card-body flex-grow-1">
                                        <h5 className="card-title">{work.workTitle}</h5>
                                        <h6 className="card-subtitle text-muted">{work.artistName}</h6>
                                        <div className="card-text text-muted mt-3">{work.workMaterials}</div>
                                        <div className="card-text text-muted">{work.workSize}</div>
                                    </div>
                                    <div className="card-body text-end">
                                        <button className="btn btn-outline-success" onClick={e => openEditModal(work)}>
                                            상세
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col">
                    <hr />
                </div>
            </div>

            {/* 페이지네이션 버튼 추가 */}
            <div className="row mt-4">
                <div className="col text-center">

                    {/* 페이지 번호 표시 */}
                    {[...Array(totalArt)].map((_, index) => (
                        <button
                            key={index}
                            className={`btn btn-outline-primary mx-1 ${page === index + 1 ? 'active' : ''}`}
                            onClick={() => pageClick(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                </div>
            </div>
        </>)}

        {collapse.ancient === true && (<>
            <div className="row text-end fw-bold">
                <div className="col-10 offset-1">
                    <div>검색결과 ({ancientList.length})</div>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col-md-10 offset-md-1">
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-5">
                        {/* 카드 */}
                        {pageAncient().map(work => (
                            <div className="col mb-3" key={work.workNo}>
                                <div className="card h-100 d-flex flex-column">
                                    <h3 className="card-header" style={{ height: '200px', overflow: 'hidden' }}>
                                        <img src={`http://localhost:8080/attach/download/${work.attachment}`}
                                            className="card-img-top"
                                            style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                    </h3>
                                    <div className="card-body flex-grow-1">
                                        <h5 className="card-title">{work.workTitle}</h5>
                                        <h6 className="card-subtitle text-muted">{work.artistName}</h6>
                                        <div className="card-text text-muted mt-3">{work.workMaterials}</div>
                                        <div className="card-text text-muted">{work.workSize}</div>
                                    </div>
                                    <div className="card-body text-end">
                                        <button className="btn btn-outline-success" onClick={e => openEditModal(work)}>
                                            상세
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="row mt-5">
                <div className="col">
                    <hr />
                </div>
            </div>

            {/* 페이지네이션 버튼 추가 */}
            <div className="row mt-4">
                <div className="col text-center">
                    {/* 이전 버튼: 첫 번째 페이지가 아닐 때만 표시 */}
                    {/* {page > 1 && (
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setPage(page - 1)}
                    >
                        이전
                    </button>
                    )} */}

                    {/* 페이지 번호 표시 */}
                    {[...Array(totalAcient)].map((_, index) => (
                        <button
                            key={index}
                            className={`btn btn-outline-primary mx-1 ${page === index + 1 ? 'active' : ''}`}
                            onClick={() => pageClick(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}

                    {/* 다음 버튼: 마지막 페이지가 아닐 때만 표시
                    // {page < totalPages && (
                    // <button
                    //     className="btn btn-outline-primary"
                    //     onClick={() => setPage(page + 1)}
                    // >
                    //     다음
                    // </button>
                    // )} */}

                </div>
            </div>
        </>)}

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
                                {target.attachment ? (<>
                                    <img src={`http://localhost:8080/attach/download/${target.attachment}`} style={{ width: 200 }} />
                                </>) : (
                                    <img src="https://placeholder.com/200" style={{ width: 200 }} />
                                )}
                            </div>
                        </div>

                        {/* 새로운 첨부 이미지 미리보기 */}
                        {attachImages.map((image, index) => (
                            <div key={index} style={{ position: "relative", display: "inline-block" }}>
                                <img src={image} alt={`미리보기 ${index + 1}`} style={{ maxWidth: '100px', margin: '5px', display: "block" }} />
                                <MdCancel
                                    style={{ position: "absolute", top: "10px", right: "10px", color: "red" }}
                                    size={20}
                                    onClick={() => deleteAttachImage(image)}
                                />
                            </div>
                        ))}

                        

                        {isEditing && (
                            <div className="row mt-2">
                                <div className="col">
                                    <label>이미지 수정</label>
                                    <input type="file" className="form-control" name="attachList" multiple
                                        accept="image/*"  onChange={changeTarget} ref={inputFileRef}/>
                                </div>
                            </div>
                        )}

                        <div className="row mt-2">
                            <div className="col">
                                <label>작품명</label>
                                <input className="form-control" type="text" value={target.workTitle} disabled={!isEditing}
                                    name="workTitle" onChange={changeTarget} />
                            </div>
                        </div>

                        {/* 작가 선택 - select option */}
                        <div className="row mt-2">
                                <div className="col">
                                    <label>작가 선택</label>
                                    <select
                                        className="form-select"
                                        name="artistNo"
                                        value={target.artistNo}
                                        disabled={!isEditing}
                                        onChange={changeTarget}>
                                        <option value="">선택</option>
                                        {artistList.map(artist => (
                                            <option key={artist.artistNo} value={artist.artistNo}>
                                                {artist.artistNo} - {artist.artistName}
                                            </option>
                                        ))}
                                    </select>
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
                                <button type="button" className="btn btn-danger" onClick={e => deleteWork(target.workNo)}>
                                    삭제
                                </button>
                            </div>
                            <div className="col">
                                <button type="button" className="btn btn-success" onClick={toggleEditMode}>
                                    {isEditing ? "완료" : "수정"}
                                </button>
                            </div>
                            <div className="col">
                                <button type="button" className="btn btn-primary" onClick={closeEditModal}>
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
                        <div className="row mt-2 text-center">
                            <div className="col">
                                {images.map((image, index) => (
                                    <img key={index} src={image} alt={`미리보기 ${index + 1}`} style={{ maxWidth: '250px', margin: '5px' }} />
                                ))}
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                <label className="form-label">파일</label>
                                {/*  multiple accept -> 어떤 형식 받을건가*/}
                                <input type="file" className={"form-control "+workfileClass} name="attachList" multiple accept="image/*" onChange={changeInput} ref={inputFileRef} 
                                                onBlur={checkWorkfile} onFocus={checkWorkfile}/>
                                <div className="valid-feedback"></div>
                                <div className="invalid-feedback"></div>
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작품명</label>
                                <input type="text" className={"form-control "+workTitleClass} name="workTitle"
                                    value={input.workTitle} onChange={changeInput} onBlur={checkWorkTitle} onFocus={checkWorkTitle}/>
                                <div className="valid-feedback"></div>
                                <div className="invalid-feedback"></div>    
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작가 선택</label>
                                <select
                                    className={"form-select "+artistNoClass}
                                    name="artistNo"
                                    value={input.artistNo}
                                    onChange={changeInput}
                                    onBlur={checkArtistNo} onFocus={checkArtistNo}>
                                    <option value="">선택</option>
                                    {artistList.map(artist => (
                                        <option key={artist.artistNo} value={artist.artistNo}>
                                            {artist.artistNo} - {artist.artistName}
                                        </option>
                                    ))}
                                </select>
                                <div className="valid-feedback"></div>
                                <div className="invalid-feedback"></div>
                            </div>
                        </div>

                        <div className="row mt-2">
                            <div className="col">
                                <label>작품설명</label>
                                <textarea className={"form-control "+workDescriptionClass} id="exampleTextarea" rows="3"
                                    style={{ minHeight: '100px' }} name="workDescription"
                                    value={input.workDescription} onChange={changeInput} onBlur={checkWorkDescription} onFocus={checkWorkDescription}/>
                                <div className="valid-feedback"></div>
                                <div className="invalid-feedback"></div>
                            </div>
                        </div>

                        <div className="rorw mt-2">
                            <div className="col">
                                <label>작품재료</label>
                                <input type="text" className={"form-control "+workMaterialsClass} name="workMaterials"
                                    value={input.workMaterials} onChange={changeInput} onBlur={checkWorkMaterials} onFocus={checkWorkMaterials}/>
                                <div className="valid-feedback"></div>
                                <div className="invalid-feedback"></div>
                            </div>
                        </div>

                        {/* Updated 작품크기 section */}
                        <div className="row mt-2">
                            <div className="col">
                                <label>작품크기</label>
                                <input type="text" className={"form-control "+workSizeClass} placeholder="가로 X 세로" name="workSize"
                                    value={input.workSize} onChange={changeInput} onBlur={checkWorkSize} onFocus={checkWorkSize}/>
                                <div className="valid-feedback"></div>
                                <div className="invalid-feedback"></div>
                            </div>
                        </div>

                        <div className="rorw mt-2">
                            <div className="col">
                                <label>작품분류</label>
                                <select type="text" name="workCategory" className={"form-select "+workCategoryClass}
                                    value={input.workCategory} onChange={changeInput} onBlur={checkWorkCategory} onFocus={checkWorkCategory}>
                                    <option value="" className="text-muted">선택하세요</option>
                                    <option>근현대</option>
                                    <option>아트</option>
                                    <option>고미술</option>
                                </select>
                                <div className="valid-feeback"></div>
                                <div className="invalid-feedback"></div>
                            </div>
                        </div>
                    </div>
                    {/* 모달 푸터 - 종료, 확인, 저장 등 각종 버튼 */}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={insertWork} disabled={!isAllValid}>등록</button>
                        <button type="button" className="btn btn-secondary btn-manual-close" onClick={closeInsertModal}>닫기</button>
                    </div>
                </div>
            </div>
        </div>

    </>);
};

export default WorkList;
