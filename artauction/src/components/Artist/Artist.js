import { useCallback, useEffect, useRef, useState } from "react";
import Jumbotron from "../Jumbotron";
import axios from "axios";
import { Modal } from "bootstrap";

const Artist = () => {
  //state
  const [input, setInput] = useState({
    artistName: "",
    artistDescription: "",
    artistHistory: "",
    artistBirth: "",
    artistDeath: "",
  });
  const [artistList, setArtistList] = useState([]);

  // 모달 관련
  const modal = useRef();
  const detailModal = useRef();

  const openModal = useCallback(() => {
    if (modal.current) {
      const tag = Modal.getOrCreateInstance(modal.current);
      tag.show();
    }
  }, [modal]);
  const openDetailModal = useCallback(() => {
    if (detailModal.current) {
      const tag = Modal.getOrCreateInstance(detailModal.current);
      tag.show();
    }
  }, [detailModal]);

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
      }
    }
  }, [detailModal]);

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
    const resp = await axios.post("http://localhost:8080/artist/", input);
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
                    <label>작가설명</label>
                    <textarea type="text" 
                    value={input.artistDescription} 
                    name="artistDescription" 
                    className="form-control" 
                    onChange={e => changeInput(e)} 
                    placeholder="작가에 대한 설명"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>작기기록</label>
                    <input type="text" 
                    name="artistHistory" 
                    className="form-control" 
                    value={input.artistHistory} 
                    onChange={e => changeInput(e)} 
                    placeholder="작품, 행보 등"
                    autoComplete="off"/>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label>태어난날</label>
                    <input type="text" 
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
                    <label>죽은날</label>
                    <input type="text" 
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
            {artistList.map((artist) => (
                <div className="mb-3 shadow-sm" key={artist.artistNo}>
                <div className="row g-0">
                    <div className="col-md-2 d-flex">
                    <div className="list-group-item text-center">
                        <strong>{artist.artistNo}</strong>
                    </div>
                    </div>
                    <div className="col-md-3 d-flex">
                    <div className="list-group-item">
                        <h5 className="mb-0">{artist.artistName}</h5>
                    </div>
                    </div>
                    <div className="col-md-5 d-flex">
                    <div className="list-group-item">
                        {artist.artistBirth} ~ {artist.artistDeath}
                    </div>
                    </div>
                    <div className="col-md-2 d-flex">
                    <button type="button" className="btn btn-outline-secondary">
                        상세
                    </button>
                    </div>
                </div>
                </div>
            ))}
        </div>
    </div>
    </>
  );
};

export default Artist;
