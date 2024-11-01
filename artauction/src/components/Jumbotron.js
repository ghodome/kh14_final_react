const Jumbotron =(props)=>{
    return (<>
            <div className="row">
                <div className="col">
                    <div className="bg-secondary p-3 rounded-0">
                        <h2 className=" text-dark">{props.title}</h2>
                        
                        <p className=" text-dark">{props.content}</p>
                        
                    </div>
                </div>
            </div>
    </>);
};

export default Jumbotron;