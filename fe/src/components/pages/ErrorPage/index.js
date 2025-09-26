
function ErrorPage(props){
    const { status, message } = props;
    return (
        <div style={{
            fontSize:'30px'
        }}>
            <h2>{status}</h2>
            <p>{message}</p>
        </div>
    )
}

export default ErrorPage;