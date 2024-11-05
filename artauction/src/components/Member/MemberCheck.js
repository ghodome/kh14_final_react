import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";

Modal.setAppElement('#root');
const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80%',
        overflowY: 'auto',
    },
};

const MemberCheck = () => {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState({
        serviceTerms: false,
        privacyPolicy: false,
        marketingConsent: false,
        promotionalConsent: false,
    });
    const [allAgreed, setAllAgreed] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const openModal = (content) => {
        setModalContent(content);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    // 약관 내용
    const serviceTermsContent = `
        본 약관은 경매사이트에서 제공하는 서비스의 이용 조건 및 절차 등을 규정합니다.<br />
        본 서비스는 경매에 참여하는 사용자와 판매자 간의 거래를 중개하며, 사용자는 본 약관을 읽고 동의함으로써 서비스를 이용할 수 있습니다.<br />
        경매사이트의 모든 사용자는 본 약관의 내용을 충분히 이해하고 동의해야 하며, 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.
    `;

    const privacyPolicyContent = `
        본 방침은 귀하의 개인정보를 어떻게 수집하고 사용하는지를 설명합니다.<br />
        1. **개인정보 수집 항목**: 이름, 이메일, 전화번호, 주소 등<br />
        2. **개인정보 이용 목적**: 서비스 제공, 고객 지원, 마케팅 정보 제공, 서비스 개선을 위한 분석 등<br />
        3. **개인정보 보유 기간**: 서비스 이용 기간 동안 보유하며, 이용 종료 후 지체 없이 삭제합니다.<br />
        4. **제3자 제공**: 귀하의 개인정보는 사전 동의 없이는 제3자에게 제공되지 않습니다.<br />
        5. **개인정보 보호**: 당사는 귀하의 개인정보를 안전하게 보호하기 위해 필요한 모든 조치를 취합니다.
    `;

    const marketingConsentContent = `
        귀하의 동의에 따라 마케팅 정보를 수신할 수 있습니다.<br />
        1. **수신 내용**: 이벤트, 프로모션, 신상품 정보, 할인 쿠폰 등<br />
        2. **수신 방법**: 이메일, SMS, 앱 푸시 알림 등으로 전달됩니다.<br />
        3. **동의 거부**: 언제든지 동의를 철회할 수 있으며, 철회 후에는 더 이상 마케팅 정보를 수신하지 않게 됩니다.<br />
        4. **데이터 분석**: 수신 동의에 따라 제공된 데이터는 서비스 개선 및 맞춤형 마케팅을 위해 사용될 수 있습니다.
    `;

    const promotionalConsentContent = `
        이벤트 및 프로모션 정보에 대한 수신 동의입니다.<br />
        1. **이벤트 참여 기회**: 특별 이벤트 및 프로모션에 참여할 수 있는 기회를 제공합니다.<br />
        2. **수신 방법**: 이메일, SMS, 웹사이트 알림 등을 통해 전달됩니다.<br />
        3. **동의 거부**: 언제든지 동의를 철회할 수 있으며, 철회 후에는 더 이상 관련 정보를 수신하지 않게 됩니다.<br />
        4. **이벤트 결과**: 참여한 이벤트에 대한 결과는 추후 공지됩니다.
    `;

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setAgreed((prev) => {
            const updatedAgreed = { ...prev, [name]: checked };
            setAllAgreed(updatedAgreed.serviceTerms && updatedAgreed.privacyPolicy && updatedAgreed.marketingConsent && updatedAgreed.promotionalConsent);
            return updatedAgreed;
        });
    };

    const handleAllCheckboxChange = (e) => {
        const checked = e.target.checked;
        setAllAgreed(checked);
        setAgreed({
            serviceTerms: checked,
            privacyPolicy: checked,
            marketingConsent: checked,
            promotionalConsent: checked,
        });
    };

    const handleSubmit = () => {
        if (agreed.serviceTerms && agreed.privacyPolicy && agreed.marketingConsent) {
            navigate('/join');
        } else {
            alert('필수 동의 항목을 모두 선택해 주세요.');
        }
    };

    return (
        <>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8">
                            <h2 style={{ fontWeight: 'bold', fontSize: '2.5rem' }}>
                                회원가입
                            </h2>
                        <div className="text-center mt-4">
                        </div>

                        <div className="mt-4">
                            <div className="mb-3">
                                <div style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                    <h4 onClick={() => openModal(serviceTermsContent)} style={{ cursor: 'pointer', color: 'black' }}>제 1 조 (목적)</h4>
                                    <div dangerouslySetInnerHTML={{ __html: serviceTermsContent }} />
                                </div>
                                <label>
                                    <input
                                        type='checkbox'
                                        name='serviceTerms'
                                        className="form-check-input rounded-0"
                                        checked={agreed.serviceTerms}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="form-check-label ms-2">이용약관 동의 (필수)</span>
                                </label>
                            </div>
                            <div className="mb-3">
                                <div style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                    <h4 onClick={() => openModal(privacyPolicyContent)} style={{ cursor: 'pointer', color: 'black' }}>제 2 조 (개인정보 처리방침)</h4>
                                    <div dangerouslySetInnerHTML={{ __html: privacyPolicyContent }} />
                                </div>
                                <label>
                                    <input
                                        type='checkbox'
                                        name='privacyPolicy'
                                        className="form-check-input rounded-0"
                                        checked={agreed.privacyPolicy}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="form-check-label ms-2">개인정보 처리방침 동의 (필수)</span>
                                </label>
                            </div>
                            <div className="mb-3">
                                <div style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                    <h4 onClick={() => openModal(marketingConsentContent)} style={{ cursor: 'pointer', color: 'black' }}>제 3 조 (마케팅 정보 수신 동의)</h4>
                                    <div dangerouslySetInnerHTML={{ __html: marketingConsentContent }} />
                                </div>
                                <label>
                                    <input
                                        type='checkbox'
                                        name='marketingConsent'
                                        className="form-check-input rounded-0"
                                        checked={agreed.marketingConsent}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="form-check-label ms-2">마케팅 정보 수신 동의 (필수)</span>
                                </label>
                            </div>
                            <div className="mb-3">
                                <div style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                    <h4 onClick={() => openModal(promotionalConsentContent)} style={{ cursor: 'pointer', color: 'black' }}>제 4 조 (이벤트 및 프로모션 정보 수신 동의)</h4>
                                    <div dangerouslySetInnerHTML={{ __html: promotionalConsentContent }} />
                                </div>
                                <label>
                                    <input
                                        type='checkbox'
                                        name='promotionalConsent'
                                        className="form-check-input rounded-0"
                                        checked={agreed.promotionalConsent}
                                        onChange={handleCheckboxChange}
                                    />
                                    <span className="form-check-label ms-2">이벤트 및 프로모션 정보 수신 동의 (선택)</span>
                                </label>
                            </div>
                            <div className="mb-4">
                                <label>
                                    <input
                                        type='checkbox'
                                        className="form-check-input rounded-0"
                                        checked={allAgreed}
                                        onChange={handleAllCheckboxChange}
                                    />
                                    <span className="form-check-label ms-2">모든 항목 동의하기</span>
                                </label>
                            </div>
                            <button className="btn btn-dark w-100 rounded-0" onClick={handleSubmit}>
                                동의
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="약관 내용"
            >
                <h2>약관 내용</h2>
                <div dangerouslySetInnerHTML={{ __html: modalContent }} />
                <button onClick={closeModal} className="btn btn-secondary rounded-0 mt-4">닫기</button>
            </Modal>
        </>
    );
};

export default MemberCheck;
