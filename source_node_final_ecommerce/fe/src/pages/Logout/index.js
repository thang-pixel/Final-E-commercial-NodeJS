import { Button } from "antd";
import { useNavigate } from "react-router-dom";

function Logout(){
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login")
    }
    return (
        <>
            <h1>Logout Page</h1>
            <Button type="primary" onClick={handleLogout}>Logout</Button>
        </>
    )
}

export default Logout;