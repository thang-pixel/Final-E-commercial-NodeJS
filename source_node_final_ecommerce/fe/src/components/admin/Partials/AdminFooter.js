import { Flex, Typography } from "antd";  
const { Text } = Typography;

function AdminFooter() {
    return (
        <footer className="admin-footer">
            <Flex justify="center" align="center">
                <Text>Admin Footer - Tran Minh Thuyen</Text>
            </Flex>
        </footer>
    );
}

export default AdminFooter;