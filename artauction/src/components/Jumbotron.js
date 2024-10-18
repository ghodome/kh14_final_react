const Jumbotron =(props)=>{
    return (<>
            <div className="row">
                <div className="col">
                    <div className="bg-dark p-3 rounded">
                        <h2 className=" text-light">{props.title}</h2>
                        
                        <p className=" text-light">{props.content}</p>
                        
                    </div>
                </div>
            </div>
    </>);
};

export default Jumbotron;