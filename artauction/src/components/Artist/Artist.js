import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { Modal } from "bootstrap";
import { a } from "hangul-js";
import { MdCancel } from "react-icons/md";
import { useRecoilValue } from "recoil";
import { memberRankState } from "../../utils/recoil";

const Artist = () => {
  //recoil
  const memberRank = useRecoilValue(memberRankState);

  //state
  const [input, setInput] = useState({
    artistName: "",
    artistDescription: "",
    artistHistory: "",
    artistBirth: "",
    artistDeath: "",
    attachList: []
  });
  const [artistList, setArtistList] = useState([]);
  const [images, setImages] = useState([]);
  const [detailArtist, setDetailArtist] = useState({
    artistName: "",
    artistDescription: "",
    artistHistory: "",
    artistBirth: "",
    artistDeath: "",
    attachment: "",
  });
  const clearInput = useCallback(() => {
    setInput({
      artistName: "",
      artistDescription: "",
      artistHistory: "",
      artistBirth: "",
      artistDeath: "",
      attachList: []
    });
  }, []);
  const [inputKeyword, setInputKeyword] = useState({
    column: "",
    keyword: "",
    beginRow: "",
    endRow: ""
  });

  const [updateInput, setUpdateInput] = useState({
    artistNo: "",
    artistName: "",
    artistDescription: "",
    artistHistory: "",
    artistBirth: "",
    artistDeath: "",
    // attachList: [],
    attachment: "",
  });
  const [updateStatus, setUpdateStatus] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  //이미지
  const inputFileRef = useRef(null);
  const [loadImages, setLoadImages] = useState([]);
  const [attachImages, setAttachImages] = useState([]);//보낼 추가 첨부사진 이미지

  // 모달 관련
  const modal = useRef();
  const detailModal = useRef();

  //페이지
  const sortedArtistList = [...artistList].sort();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const totalPage = Math.ceil(sortedArtistList.length / pageSize);

  const pageClick = useCallback((pageNumber) => {
    setPage(pageNumber);
  }, []);

  const openModal = useCallback(() => {
    if (modal.current) {
      const tag = Modal.getOrCreateInstance(modal.current);
      tag.show();
    }
  }, [modal]);
  const openDetailModal = useCallback((artist) => {
    if (detailModal.current) {
      setDetailArtist({ ...artist });
      setUpdateInput({
        // artistNo: artist.artistNo,
        // artistName: artist.artistName,
        // artistDescription: artist.artistDescription,
        // artistHistory: artist.artistHistory,
        // artistBirth: artist.artistBirth,
        // artistDeath: artist.artistDeath,
        // attachment:artist.attachment
        ...artist
      });
      setIsEditing(false); // 모달이 열릴 때는 편집 모드 해제
      const tag = Modal.getOrCreateInstance(detailModal.current);
      tag.show();
    }
  }, [detailModal, detailArtist, updateInput]);

  const closeModal = useCallback(() => {
    if (modal.current) {
      const tag = Modal.getInstance(modal.current);
      if (tag) {
        tag.hide();
        clearInput();//입력창 청소
      }
    }
  }, [modal]);
  const closeDetailModal = useCallback(() => {
    if (detailModal.current) {
      const tag = Modal.getInstance(detailModal.current);
      if (tag) {
        tag.hide();
        setUpdateStatus({});
        setUpdateInput({});
        setAttachImages([]); // 미리보기 이미지 초기화
        clearEState();
        clearInput();//입력창 청소
      }
    }
  }, [detailModal, updateStatus]);

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

  const loadArtistList = useCallback(async () => {
    const resp = await axios.post("http://localhost:8080/artist/", inputKeyword);
    setArtistList(resp.data.artistList);
  }, [artistList, inputKeyword]);

  const registInput = useCallback(async () => {
    const formData = new FormData();

    const fileList = inputFileRef.current.files;

    for (let i = 0; i < fileList.length; i++) {
      formData.append("attachList", fileList[i]);
    }

    formData.append("artistName", input.artistName);
    formData.append("artistDescription", input.artistDescription);
    formData.append("artistHistory", input.artistHistory);
    formData.append("artistBirth", input.artistBirth);
    formData.append("artistDeath", input.artistDeath);

    await axios.post("http://localhost:8080/artist/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    inputFileRef.current.value = ""
    clearState();
    closeModal();
    loadArtistList();
    setImages([]);
  }, [input]);

  const deleteArtist = useCallback(async (artistNo) => {
    await axios.delete(`http://localhost:8080/artist/${artistNo}`);
    window.alert("삭제가 완료되었습니다.");
    loadArtistList();
    closeDetailModal();
  }, [])

  const changeStatus = useCallback((e) => {
    setUpdateStatus({
      ...updateStatus,
      [e.target.name]: e.target.checked
    })
    if (!e.target.checked) {
      setUpdateInput({
        ...updateInput,
        [e.target.name]: null
      })
    }
  }, [updateStatus, updateInput]);

  const changeUpdateInput = useCallback((e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file") {
      const fileArray = Array.from(files);
      setUpdateInput((prevInput) => ({
        ...prevInput,
        attachList: fileArray,
      }));
      
      // 파일 이미지 미리보기 로직
      const imageUrls = fileArray.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
      });
      Promise.all(imageUrls).then((urls) => setAttachImages(urls));
    } else {
      setUpdateInput((prevInput) => ({
        ...prevInput,
        [name]: value,
      }));
    }
  }, [setUpdateInput]);


  // const updateArtist = useCallback(async () => {
  //   const formData = new FormData();
  //   const fileList = inputFileRef.current.files;

  //   for (let i = 0; i < fileList.length; i++) {
  //     formData.append("attachList", fileList[i]);
  //   }
  //   formData.append("artistNo", updateInput.artistNo);
  //   formData.append("artistName", updateInput.artistName);
  //   formData.append("artistDescription", updateInput.artistDescription);
  //   formData.append("artistHistory", updateInput.artistHistory);
  //   formData.append("artistBirth", updateInput.artistBirth);
  //   formData.append("artistDeath", updateInput.artistDeath);

  //   formData.append("originList", updateInput.attachment); //updateInput.attachment /  loadImages

  //   await axios.post("http://localhost:8080/artist/edit", formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   });

  //   setImages(loadImages);

  //   loadArtistList();
  //   closeDetailModal();
  // }, [updateInput, loadImages])
  const updateArtist = useCallback(async () => {
    const formData = new FormData();
    const fileList = inputFileRef.current.files;

    for (let i = 0; i < fileList.length; i++) {
      formData.append("attachList", fileList[i]);
    }
    formData.append("artistNo", updateInput.artistNo);
    formData.append("artistName", updateInput.artistName);
    formData.append("artistDescription", updateInput.artistDescription);
    formData.append("artistHistory", updateInput.artistHistory);
    formData.append("artistBirth", updateInput.artistBirth);
    formData.append("artistDeath", updateInput.artistDeath);

    // 파일이 새로 첨부된 경우 loadImages를, 그렇지 않다면 updateInput.attachment를 사용
    const originList = fileList.length > 0 ? loadImages : updateInput.attachment;
    formData.append("originList", originList);

    await axios.post("http://localhost:8080/artist/edit", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // 새로 첨부된 파일이 없을 경우, 기존 이미지를 유지하거나 빈 배열로 설정
    setImages(fileList.length > 0 ? loadImages : (updateInput.attachment ? [updateInput.attachment] : []));

    loadArtistList();
    clearEState();
    closeDetailModal();
  }, [updateInput, loadImages]);

  const deleteAttachImage = useCallback((img) => {
    //이미지 미리보기에서 삭제
    setAttachImages(prevImages => prevImages.filter(image => image !== img));
  }, []);

  //effect
  useEffect(() => {
    loadArtistList();
  }, []);

  const pageArtist = useCallback(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return sortedArtistList.slice(startIndex, endIndex);
  }, [sortedArtistList]);

  const toggleEditMode = () => {
    if (isEditing) {
      updateArtist();
    }
    setIsEditing(!isEditing);
  };

  //------------------작가 등록 형식검사-----------------------------
  const [artistFileValid, setArtistFileValid] = useState(false);
  const [artistNameValid, setArtistNameValid] = useState(false);
  const [artistDescriptionValid, setArtistDescriptionValid] = useState(false);
  const [artistHistoryValid, setArtistHistoryValid] = useState(false);
  const [artistBirthValid, setArtistBirthValid] = useState(false);
  const [artistDeathValid, setArtistDeathValid] = useState(false);

  const [artistFileClass, setArtistFileClass] = useState("");
  const [artistNameClass, setArtistNameClass] = useState("");
  const [artistDescriptionClass, setArtistDescriptionClass] = useState("");
  const [artistHistoryClass, setArtistHistoryClass] = useState("");
  const [artistBirthClass, setArtistBirthClass] = useState("");
  const [artistDeathClass, setArtistDeathClass] = useState("");

  const checkArtistFile = useCallback(() => {
    const valid = input.attachList.length > 0;
    setArtistFileValid(valid);
    if (input.attachList.length === 0) setArtistFileClass("");
    else setArtistFileClass(valid ? "is-valid" : "is-invalid");
  }, [input]);

  const checkArtistName = useCallback(() => {
    const regex = /^([가-힣]{2,7}|[a-zA-Z ]{1,30})$/;
    const valid = regex.test(input.artistName);
    setArtistNameValid(valid);
    if (input.artistName.length === 0) setArtistNameClass("");
    else setArtistNameClass(valid ? "is-valid" : "is-invalid");
  }, [input]);

  const checkArtistDescription = useCallback(() => {
    const regex = /^.{1,300}$/;
    const valid = regex.test(input.artistDescription);
    setArtistDescriptionValid(valid);
    if (input.artistDescription.length === 0) setArtistDescriptionClass("");
    else setArtistDescriptionClass(valid ? "is-valid" : "is-invalid");
  }, [input]);

  const checkArtistHistory = useCallback(() => {
    const regex = /^.{1,300}$/;
    const valid = regex.test(input.artistHistory);
    setArtistHistoryValid(valid);
    if (input.artistHistory.length === 0) setArtistHistoryClass("");
    else setArtistHistoryClass(valid ? "is-valid" : "is-invalid");
  }, [input]);

  const checkArtistBirth = useCallback(() => {
    const regex = /^([0-9]{4})-(02-(0[1-9]|1[0-9]|2[0-8])|(0[469]|11)-(0[1-9]|1[0-9]|2[0-9]|30)|(0[13578]|1[02])-(0[1-9]|1[0-9]|2[0-9]|3[01]))$/;
    const valid = regex.test(input.artistBirth);
    setArtistBirthValid(valid);
    if (input.artistBirth.length === 0) setArtistBirthClass("");
    else setArtistBirthClass(valid ? "is-valid" : "is-invalid");
  }, [input]);

  const checkArtistDeath = useCallback(() => {
    const regex = /^([0-9]{4})-(02-(0[1-9]|1[0-9]|2[0-8])|(0[469]|11)-(0[1-9]|1[0-9]|2[0-9]|30)|(0[13578]|1[02])-(0[1-9]|1[0-9]|2[0-9]|3[01]))$/;
    const valid = regex.test(input.artistDeath);
    setArtistDeathValid(valid);
    if (input.artistDeath.length === 0) setArtistDeathClass("");
    else setArtistDeathClass(valid ? "is-valid" : "is-invalid");
  }, [input]);

  const isAllValid = useMemo(() => {
    return artistFileValid && artistNameValid && artistDescriptionValid && artistHistoryValid
      && artistBirthValid && artistDeathValid
  }, [artistFileValid, artistNameValid, artistDescriptionValid, artistHistoryValid, artistBirthValid, artistDeathValid]);

  const clearState = useCallback(() => {
    setArtistFileValid(false);
    setArtistNameValid(false);
    setArtistDescriptionValid(false);
    setArtistHistoryValid(false);
    setArtistBirthValid(false);
    setArtistDeathValid(false);

    setArtistFileClass("");
    setArtistNameClass("");
    setArtistDescriptionClass("");
    setArtistHistoryClass("");
    setArtistBirthClass("");
    setArtistDeathClass("");
  }, []);

  //-------------------------------------------- 작가 수정 형식 검사 ------------------------------------------------
  const [artistFileEValid, setArtistFileEValid] = useState(true);
  const [artistNameEValid, setArtistNameEValid] = useState(true);
  const [artistDescriptionEValid, setArtistDescriptionEValid] = useState(true);
  const [artistHistoryEValid, setArtistHistoryEValid] = useState(true);
  const [artistBirthEValid, setArtistBirthEValid] = useState(true);
  const [artistDeathEValid, setArtistDeathEValid] = useState(true);

  const [artistFileEClass, setArtistFileEClass] = useState("");
  const [artistNameEClass, setArtistNameEClass] = useState("");
  const [artistDescriptionEClass, setArtistDescriptionEClass] = useState("");
  const [artistHistoryEClass, setArtistHistoryEClass] = useState("");
  const [artistBirthEClass, setArtistBirthEClass] = useState("");
  const [artistDeathEClass, setArtistDeathEClass] = useState("");

  const checkArtistFileE = useCallback(() => {
    const valid = (input.attachList && input.attachList.length > 0);
    setArtistFileValid(valid);

    // updateInput.attachList가 정의되어 있는지 먼저 확인
    if (!updateInput.attachList || updateInput.attachList.length === 0) {
      setArtistFileClass("");
    } else {
      setArtistFileClass(valid ? "is-valid" : "is-invalid");
    }
  }, [updateInput]);

  const checkArtistNameE = useCallback(() => {
    const regex = /^([가-힣]{2,7}|[a-zA-Z ]{1,30})$/;
    const valid = regex.test(updateInput.artistName);
    setArtistNameEValid(valid);
    if (updateInput.artistName.length === 0) setArtistNameEClass("");
    else setArtistNameEClass(valid ? "is-valid" : "is-invalid");
  }, [updateInput]);

  const checkArtistDescriptionE = useCallback(() => {
    const regex = /^.{1,300}$/;
    const valid = regex.test(updateInput.artistDescription);
    setArtistDescriptionEValid(valid);
    if (updateInput.artistDescription.length === 0) setArtistDescriptionEClass("");
    else setArtistDescriptionEClass(valid ? "is-valid" : "is-invalid");
  }, [updateInput]);

  const checkArtistHistoryE = useCallback(() => {
    const regex = /^.{1,300}$/;
    const valid = regex.test(updateInput.artistHistory);
    setArtistHistoryEValid(valid);
    if (updateInput.artistHistory.length === 0) setArtistHistoryEClass("");
    else setArtistHistoryEClass(valid ? "is-valid" : "is-invalid");
  }, [updateInput]);

  const checkArtistBirthE = useCallback(() => {
    const regex = /^([0-9]{4})-(02-(0[1-9]|1[0-9]|2[0-8])|(0[469]|11)-(0[1-9]|1[0-9]|2[0-9]|30)|(0[13578]|1[02])-(0[1-9]|1[0-9]|2[0-9]|3[01]))$/;
    const valid = regex.test(updateInput.artistBirth);
    setArtistBirthEValid(valid);
    if (updateInput.artistBirth.length === 0) setArtistBirthEClass("");
    else setArtistBirthEClass(valid ? "is-valid" : "is-invalid");
  }, [updateInput]);

  const checkArtistDeathE = useCallback(() => {
    const regex = /^([0-9]{4})-(02-(0[1-9]|1[0-9]|2[0-8])|(0[469]|11)-(0[1-9]|1[0-9]|2[0-9]|30)|(0[13578]|1[02])-(0[1-9]|1[0-9]|2[0-9]|3[01]))$/;
    const valid = regex.test(updateInput.artistDeath);
    setArtistDeathEValid(valid);
    if (updateInput.artistDeath.length === 0) setArtistDeathEClass("");
    else setArtistDeathEClass(valid ? "is-valid" : "is-invalid");
  }, [updateInput]);

  const isAllEValid = useMemo(() => {
    return artistFileEValid && artistNameEValid && artistDescriptionEValid && artistHistoryEValid
      && artistBirthEValid && artistDeathEValid
  }, [artistFileEValid, artistNameEValid, artistDescriptionEValid, artistHistoryEValid, artistBirthEValid, artistDeathEValid]);

  const clearEState = useCallback(() => {
    setArtistFileEValid(true);
    setArtistNameEValid(true);
    setArtistDescriptionEValid(true);
    setArtistHistoryEValid(true);
    setArtistBirthEValid(true);
    setArtistDeathEValid(true);

    setArtistFileEClass("");
    setArtistNameEClass("");
    setArtistDescriptionEClass("");
    setArtistHistoryEClass("");
    setArtistBirthEClass("");
    setArtistDeathEClass("");
  }, []);

  //-------------------------------------------------------------------------------------------------


  return (
    <>
      <div className="row mt-3">
        <div className="col-11 text-end">
          {memberRank === '관리자' && <button className="btn btn-primary"
            onClick={openModal}>작가 등록하기</button>
          }
        </div>
      </div>

      <div className="modal fade" tabIndex="-1" ref={modal}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">작가 등록</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col">
                  <label>작가 이미지</label>
                  <input type="file" className={"form-control " + artistFileClass} name="attachList" multiple accept="image/*" onChange={changeInput} ref={inputFileRef}
                    onBlur={checkArtistFile} onFocus={checkArtistFile} />
                  {images.map((image, index) => (
                    <img key={index} src={image} alt={`미리보기 ${index + 1}`} style={{ maxWidth: '100px', margin: '5px' }} />
                  ))}
                  <div className="valid-feedback"></div>
                  <div className="invalid-feedback"></div>
                </div>
              </div>


              <div className="row">
                <div className="col">
                  <label>작가명</label>
                  <input type="text"
                    value={input.artistName}
                    name="artistName"
                    className={"form-control " + artistNameClass}
                    onChange={changeInput}
                    placeholder="작가명"
                    autoComplete="off"
                    onBlur={checkArtistName}
                    onFocus={checkArtistName} />
                  <div className="valid-feedback"></div>
                  <div className="invalid-feedback"></div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>작가 설명</label>
                  <textarea type="text"
                    value={input.artistDescription}
                    name="artistDescription"
                    className={"form-control " + artistDescriptionClass}
                    onChange={e => changeInput(e)}
                    placeholder="작가에 대한 소개"
                    autoComplete="off"
                    onBlur={checkArtistDescription}
                    onFocus={checkArtistDescription} />
                  <div className="valid-feedback"></div>
                  <div className="invalid-feedback"></div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>작가 기록</label>
                  <input type="text"
                    name="artistHistory"
                    className={"form-control " + artistHistoryClass}
                    value={input.artistHistory}
                    onChange={e => changeInput(e)}
                    placeholder="작품, 활동 등"
                    autoComplete="off"
                    onBlur={checkArtistHistory}
                    onFocus={checkArtistHistory} />
                  <div className="valid-feedback"></div>
                  <div className="invalid-feedback"></div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>출생</label>
                  <input type="date"
                    name="artistBirth"
                    className={"form-control " + artistBirthClass}
                    value={input.artistBirth}
                    onChange={e => changeInput(e)}
                    placeholder="yyyy-mm-dd 형식으로만"
                    autoComplete="off"
                    onBlur={checkArtistBirth}
                    onFocus={checkArtistBirth} />
                  <div className="valid-feedback"></div>
                  <div className="invalid-feedback"></div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>사망</label>
                  <input type="date"
                    name="artistDeath"
                    className={"form-control " + artistDeathClass}
                    value={input.artistDeath}
                    onChange={e => changeInput(e)}
                    placeholder="yyyy-mm-dd 형식으로만"
                    autoComplete="off"
                    onBlur={checkArtistDeath}
                    onFocus={checkArtistDeath} />
                  <div className="valid-feedback"></div>
                  <div className="invalid-feedback"></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-success"
                onClick={registInput}
                disabled={!isAllValid}>
                등록
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3 mx-3">
        <div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
          {artistList.length > 0 && pageArtist().map((artist, index) => (
            <div className="mb-3 shadow-sm" key={`${artist.artistNo}-${index}`}>
              <div className="row g-0">
                <div className="col-md-2 d-flex">
                  <div className="list-group-item text-center">
                    <strong>{artist.artistNo}</strong>
                  </div>
                </div>
                <div className="col-md-3 d-flex">
                  <div className="list-group-item">
                    {artist.artistName}
                  </div>
                </div>
                <div className="col-md-5 d-flex">
                  <div className="list-group-item">
                    {artist.artistBirth} ~ {new Date(artist.artistDeath) <= new Date() && artist.artistDeath}
                  </div>
                </div>
                <div className="col-md-2 d-flex">
                  <button type="button" className="btn btn-outline-success"
                    onClick={e => openDetailModal(artist)}>
                    상세
                  </button>
                </div>
              </div>
            </div>
          ))}
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
              {[...Array(totalPage)].map((_, index) => (
                <button
                  key={index}
                  className={`btn btn-outline-primary mx-1 ${page === index + 1 ? 'active' : ''}`}
                  onClick={() => pageClick(index + 1)}
                >
                  {index + 1}
                </button>
              ))}

              {/* 다음 버튼: 마지막 페이지가 아닐 때만 표시 */}
              {/* {page < totalPage && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setPage(page + 1)}
                >
                  다음
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>
      {/* 작가 상세 모달 */}
      <div className="modal fade" tabIndex="-1" ref={detailModal}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title text-danger">작가 정보 상세</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeDetailModal}></button>
            </div>
            <div className="modal-body">
              <div className="row text-center">
                <div className="col">
                  {detailArtist.attachment ? (
                    <img src={`http://localhost:8080/attach/download/${detailArtist.attachment}`} style={{ width: 200 }} />
                  ) : (
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
                    <input type="file" className={"form-control " + artistFileEClass} name="attachList" multiple
                      accept="image/*" onChange={e => changeUpdateInput(e)} ref={inputFileRef}
                      onBlur={checkArtistFileE} onFocus={checkArtistFileE} />
                    <div className="valid-feedback"></div>
                    <div className="invalid-feedback"></div>
                  </div>
                </div>
              )}


              <div className="row mt-3">
                <div className="col">
                  <label>작가명</label>
                  <div className="row">
                    <div className="col">
                      {/* {updateStatus.artistName == true ? (<> */}
                      <input type="text" name="artistName"
                        value={updateInput.artistName || ""}
                        className={"form-control " + artistNameEClass}
                        onChange={e => changeUpdateInput(e)}
                        onBlur={checkArtistNameE}
                        onFocus={checkArtistNameE}
                        disabled={!isEditing} />
                      <div className="valid-feedback"></div>
                      <div className="invalid-feedback"></div>
                      {/* </>) : (<p>{detailArtist.artistName}</p>)} */}
                    </div>
                    {/* <div className="col-2">
                      <input type="checkbox" name="artistName"
                        onChange={e => changeStatus(e)}></input>
                    </div> */}
                  </div>

                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>작가설명</label>
                  <div className="row">
                    <div className="col">
                      {/* {updateStatus.artistDescription == true ? (<> */}
                      <input type="text" name="artistDescription"
                        value={updateInput.artistDescription || ""}
                        className={"form-control " + artistDescriptionEClass}
                        onChange={e => changeUpdateInput(e)}
                        onBlur={checkArtistDescriptionE}
                        onFocus={checkArtistDescriptionE}
                        disabled={!isEditing} />
                      <div className="valid-feedback"></div>
                      <div className="invalid-feedback"></div>
                      {/* </>) : (<p>{detailArtist.artistDescription}</p>)} */}
                    </div>
                    {/* <div className="col-2">
                      <input type="checkbox" name="artistDescription"
                        onChange={e => changeStatus(e)}></input>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>작가기록</label>
                  <div className="row">
                    <div className="col">
                      {/* {updateStatus.artistHistory == true ? (<> */}
                      <input type="text" name="artistHistory"
                        value={updateInput.artistHistory || ""}
                        className={"form-control " + artistHistoryEClass}
                        onChange={e => changeUpdateInput(e)}
                        onBlur={checkArtistHistoryE}
                        onFocus={checkArtistHistoryE}
                        disabled={!isEditing} />
                      <div className="valid-feedback"></div>
                      <div className="invalid-feedback"></div>
                      {/* </>) : (<p>{detailArtist.artistHistory}</p>)} */}
                    </div>
                    {/* <div className="col-2">
                      <input type="checkbox" name='artistHistory'
                        onChange={e => changeStatus(e)}></input>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>탄생</label>
                  <div className="row">
                    <div className="col">
                      {/* {updateStatus.artistBirth == true ? (<> */}
                      <input type="date" name="artistBirth"
                        value={updateInput.artistBirth || ""}
                        className={"form-control " + artistBirthEClass}
                        onChange={e => changeUpdateInput(e)}
                        onBlur={checkArtistBirthE}
                        onFocus={checkArtistBirthE}
                        disabled={!isEditing} />
                      <div className="valid-feedback"></div>
                      <div className="invalid-feedback"></div>
                      {/* </>) : (<p>{detailArtist.artistBirth}</p>)} */}
                    </div>
                    {/* <div className="col-2">
                      <input type="checkbox" name='artistBirth'
                        onChange={e => changeStatus(e)}></input>
                    </div> */}
                  </div>
                </div>
              </div>
              <div className="row">
  <div className="col">
    <label>사망</label>
    <div className="row">
      <div className="col">
        {isEditing ? (
          <input
            type="date"
            name="artistDeath"
            value={updateInput.artistDeath || ""}
            className={"form-control " + artistDeathEClass}
            onChange={changeUpdateInput}
            onBlur={checkArtistDeathE}
            onFocus={checkArtistDeathE}
          />
        ) : (
          new Date(updateInput.artistDeath) <= new Date() ? (
            <p>{updateInput.artistDeath}</p>
          ) : (
            <input placeholder=" - " disabled className="form-control"/>
          )
        )}
        <div className="valid-feedback"></div>
        <div className="invalid-feedback"></div>
      </div>
    </div>
  </div>
</div>
            </div>
            <div className="modal-footer">
              <div className="row">
                <div className="col-4">
                  {memberRank === '관리자' &&
                    <button type="button" className="btn btn-danger"
                      onClick={e => deleteArtist(detailArtist.artistNo)}>
                      삭제
                    </button>
                  }
                </div>
                <div className="col-4">
                  {memberRank === '관리자' &&
                    <button type="button" className="btn btn-success"
                      onClick={toggleEditMode} disabled={isAllEValid === false}>
                      {isEditing ? "완료" : "수정"}
                    </button>
                  }
                </div>
                <div className="col-4">
                  {memberRank === '관리자' &&
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={closeDetailModal}>
                      확인
                    </button>
                  }
                </div>
                  {memberRank !== '관리자' &&
                <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={closeDetailModal}>
                      확인
                    </button>
                </div>
                  }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Artist;
