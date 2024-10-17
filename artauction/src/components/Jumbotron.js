const Jumbotron =(props)=>{
    return (<>
        <div className="container-fluid">
            <div className="row">
                <div className="col-sm-10 offset-sm-1">
                    <div className="bg-dark p-3 rounded">
                        <h2 className=" text-light">{props.title}</h2>
                        <p className=" text-light">{props.content}</p>
                        
                    </div>
                </div>
            </div>
        </div>
    </>);
};

export default Jumbotron;