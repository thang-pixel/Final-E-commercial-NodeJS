
function CustomerFooter() {
    return (
        <div className=" container mx-auto min-h-40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            <div className="footer-item">
                <p className="text-lg font-bold uppercase">kết nối</p>
                <ul className="flex flex-col gap-2">
                    <li><a href="/">Facebook</a></li>
                    <li><a href="/">Twitter</a></li>
                    <li><a href="/">Instagram</a></li>
                </ul> 
            </div>
            <div className="footer-item">
                <p className="text-lg font-bold uppercase">Về chúng TÔI</p>
                <ul className="flex flex-col gap-2">
                    <li><a href="/">Giới thiệu</a></li>
                    <li><a href="/">Sứ mệnh</a></li>
                    <li><a href="/">Đội ngũ</a></li>
                </ul> 
            </div>
            <div className="footer-item">
                <p className="text-lg font-bold uppercase">Chính sách</p>
                <ul className="flex flex-col gap-2">
                    <li><a href="/">Chính sách bảo hành</a></li>
                    <li><a href="/">Chính sách bảo mật</a></li>
                    <li><a href="/">Chính sách thu thập dữ liệu</a></li>
                </ul> 
            </div>
        </div>
    );
}

export default CustomerFooter;