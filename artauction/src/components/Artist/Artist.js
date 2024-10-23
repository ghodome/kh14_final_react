import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { Modal } from "bootstrap";

const Artist = () => {
  //state
  const [input, setInput] = useState({
    });
  const [artistList, setArtistList] = useState([]);
  const [detailArtist,setDetailArtist] = useState({
    artistName: "",
    artistDescription: "",
    artistHistory: "",
    artistBirth: "",
    artistDeath: "",
  });

  const [updateInput,setUpdateInput]=useState({});
  const [updateStatus,setUpdateStatus]=useState({});
  // 모달 관련
  const modal = useRef();
  const detailModal = useRef();

  const openModal = useCallback(() => {
    if (modal.current) {
      const tag = Modal.getOrCreateInstance(modal.current);
      tag.show();
    }
  }, [modal]);
  const openDetailModal = useCallback((artist) => {
    if (detailModal.current) {
        setUpdateInput({
            ...updateInput,
            artistNo:artist.artistNo
        })
        setDetailArtist({...artist});
        const tag = Modal.getOrCreateInstance(detailModal.current);
        tag.show();
    }
  }, [detailModal,detailArtist,updateInput]);

  const closeModal = useCallback(() => {
    if (modal.current) {
      const tag = Modal.getInstance(modal.current);
      if (tag) {
        tag.hide();
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
      }
    }
  }, [detailModal,updateStatus]);

  const changeInput = useCallback(
    (e) => {
      setInput({
        ...input,
        [e.target.name]: e.target.value,
      });
    },
    [input]
  );

  const loadArtistList = useCallback(async () => {
    const resp = await axios.get("http://localhost:8080/artist/");
    setArtistList(resp.data);
  }, []);

  const registInput = useCallback(async () => {
    await axios.post("http://localhost:8080/artist/", input);
    window.alert("등록 되었습니다.")
    setInput({
      artistName: "",
      artistDescription: "",
      artistHistory: "",
      artistBirth: "",
      artistDeath: "",
    });
    closeModal();
    loadArtistList();
    
  }, [input]);

  const deleteArtist=useCallback(async (artistNo)=>{
    await axios.delete(`http://localhost:8080/artist/${artistNo}`);
    window.alert("삭제가 완료되었습니다.");
    loadArtistList();
    closeDetailModal();
  },[])
  const changeStatus = useCallback((e) => {
    setUpdateStatus({
        ...updateStatus,
        [e.target.name]:e.target.checked
    })
    if(!e.target.checked){
        setUpdateInput({
            ...updateInput,
            [e.target.name]:null
        })
    }
}, [updateStatus,updateInput]);
  const changeUpdateInput=useCallback((e)=>{
    setUpdateInput({
        ...updateInput,
        [e.target.name]:e.target.value
    })
  },[updateInput]);


  const updateArtist=useCallback(async ()=>{
    const resp=await axios.patch("http://localhost:8080/artist/",updateInput);
    loadArtistList();
    closeDetailModal();
  },[updateInput])

  //effect
  useEffect(() => {
    loadArtistList();
  }, [loadArtistList]);

  return (
    <>
      <Jumbotron title="작가 페이지"></Jumbotron>
      <div className="row mt-3">
        <div className="col-11 text-end">
          <button className="btn btn-secondary" onClick={openModal}>
            작가 등록하기
          </button>
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
                  <label>작가명</label>
                  <input type="text"
                    value={input.artistName}
                    name="artistName"
                    className="form-control"
                    onChange={changeInput}
                    placeholder="작가명"
                    autoComplete="off"/>
                </div>
              </div>
              <div className="row">
                <div className="col">
                    <label>작가 설명</label>
                    <textarea type="text" 
                    value={input.artistDescription} 
                    name="artistDescription" 
                    className="form-control" 
                    onChange={e => changeInput(e)} 
                    placeholder="작가에 대한 소개"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>작가 기록</label>
                    <input type="text" 
                    name="artistHistory" 
                    className="form-control" 
                    value={input.artistHistory} 
                    onChange={e => changeInput(e)} 
                    placeholder="작품, 활동 등"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>출생</label>
                    <input type="date" 
                    name="artistBirth" 
                    className="form-control" 
                    value={input.artistBirth} 
                    onChange={e => changeInput(e)} 
                    placeholder="yyyy-mm-dd 형식으로만"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>사망</label>
                    <input type="date" 
                    name="artistDeath" 
                    className="form-control" 
                    value={input.artistDeath} 
                    onChange={e => changeInput(e)} 
                    placeholder="yyyy-mm-dd 형식으로만"
                    autoComplete="off"/>
                </div>
            </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-lg btn-success"
                onClick={registInput}>
                등록
              </button>
              <button
                type="button"
                className="btn btn-lg btn-secondary"
                onClick={closeModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      </div>

    <div className="row mt-3 mx-3">
        <div className="col-md-10 offset-md-1 col-lg-8 offset-lg-2">
            {artistList.length>0&&artistList.map((artist) => (
                <div className="mb-3 shadow-sm" key={artist.artistNo}>
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
                        {artist.artistBirth} ~ {artist.artistDeath}
                    </div>
                    </div>
                    <div className="col-md-2 d-flex">
                    <button type="button" className="btn btn-outline-secondary"
                        onClick={e=>openDetailModal(artist)}>
                        상세
                    </button>
                    </div>
                </div>
                </div>
            ))}
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
              <div className="row">
                <div className="col">
                  <label>작가명</label>
                  <div className="row">
                    <div className="col-10">
                        {updateStatus.artistName==true?(<>
                        <input type="text" name="artistName"
                        value={updateInput.artistName} 
                        className="form-control"
                        onChange={e=>changeUpdateInput(e)}></input>
                        </>):(<p>{detailArtist.artistName}</p>)}
                    </div>
                    <div className="col-2">
                        <input type="checkbox" name="artistName"
                        onChange={e=>changeStatus(e)}></input>
                    </div>
                  </div>

                </div>
              </div>
              <div className="row"> 
                <div className="col">
                    <label>작가설명</label>
                    <div className="row">
                    <div className="col-10">
                        {updateStatus.artistDescription==true?(<>
                        <input type="text" name="artistDescription"
                        value={updateInput.artistDescription} 
                        className="form-control"
                        onChange={e=>changeUpdateInput(e)}></input>
                        </>):(<p>{detailArtist.artistDescription}</p>)}
                    </div>
                    <div className="col-2">
                    <input type="checkbox" name="artistDescription"
                    onChange={e=>changeStatus(e)}></input>
                    </div>
                  </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>작가기록</label>
                    <div className="row">
                    <div className="col-10">
                        {updateStatus.artistHistory==true?(<>
                        <input type="text" name="artistHistory"
                        value={updateInput.artistHistory} 
                        className="form-control"
                        onChange={e=>changeUpdateInput(e)}></input>
                        </>):(<p>{detailArtist.artistHistory}</p>)}
                    </div>
                    <div className="col-2">
                    <input type="checkbox" name='artistHistory'
                    onChange={e=>changeStatus(e)}></input>
                    </div>
                  </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>탄생</label>
                    <div className="row">
                    <div className="col-10">
                        {updateStatus.artistBirth==true?(<>
                        <input type="date" name="artistBirth"
                        value={updateInput.artistBirth} 
                        className="form-control"
                        onChange={e=>changeUpdateInput(e)}></input>
                        </>):(<p>{detailArtist.artistBirth}</p>)}
                    </div>
                    <div className="col-2">
                    <input type="checkbox" name='artistBirth'
                    onChange={e=>changeStatus(e)}></input>
                    </div>
                  </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>사망</label>
                    <div className="row">
                    <div className="col-10">
                        {updateStatus.artistDeath==true?(<>
                        <input type="date" name="artistDeath"
                        value={updateInput.artistDeath} 
                        className="form-control"
                        onChange={e=>changeUpdateInput(e)}></input>
                        </>):(<p>{detailArtist.artistDeath}</p>)}
                    </div>
                    <div className="col-2">
                        <input type="checkbox" name='artistDeath'
                        onChange={e=>changeStatus(e)}></input>
                    </div>
                  </div>
                </div>
            </div>
            </div>
            <div className="modal-footer">
                <div className="row">
                    <div className="col-4">
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={e=>deleteArtist(detailArtist.artistNo)}>
                            삭제
                        </button>
                    </div>
                    <div className="col-4">
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={updateArtist}>
                            변경
                        </button>
                    </div>
                    <div className="col-4">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={closeDetailModal}>
                            확인
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Artist;
