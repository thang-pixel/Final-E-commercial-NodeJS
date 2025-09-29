import { Flex, Typography } from "antd";  
const { Text } = Typography;

function CustomerFooter() {
    return (
        <footer className="customer-footer">
            <Flex justify="center" align="center">
                <Text>Customer Footer - Tran Minh Thuyen</Text>
            </Flex>
        </footer>
    );
}

export default CustomerFooter;