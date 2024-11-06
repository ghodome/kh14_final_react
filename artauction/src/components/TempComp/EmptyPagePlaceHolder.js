import { useNavigate } from "react-router-dom";

const EmptyPagePlaceHolder =({ message = "데이터가 없습니다." })=>{

    const navigate=useNavigate();

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',   // 화면 전체 높이로 중앙 배치
            textAlign: 'center',
        },
        content: {
            maxWidth: '400px',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        },
        icon: {
            fontSize: '4rem',
            marginBottom: '20px',
        },
        message: {
            fontSize: '1.5rem',
            color: '#666',
        },
        button: {
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '1rem',
            color: '#fff',
            backgroundColor: '#007bff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
    };
    return (<>
        <div style={styles.container}>
            <div style={styles.content}>
                <div style={styles.icon}>📄</div>
                <h2 style={styles.message}>{message}</h2>
                    <button className="btn btn-dark m-2" onClick={e=>navigate(-1)}>
                        뒤로 가기
                    </button>
            </div>
        </div>
    </>);
}



export default EmptyPagePlaceHolder;