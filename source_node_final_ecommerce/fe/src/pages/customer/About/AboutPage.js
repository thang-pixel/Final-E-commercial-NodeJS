import { Typography } from '@mui/material';

const AboutPage = () => {
  return (
    <div className="about-page-container p-4 md:p-8 lg:p-12">
      <Typography variant="h4" component="h1" gutterBottom>
        Giới thiệu về chúng tôi
      </Typography>
      <Typography variant="body1" paragraph>
        Chúng tôi là một công ty chuyên cung cấp các sản phẩm chất lượng cao với
        dịch vụ khách hàng tận tâm. Sứ mệnh của chúng tôi là mang đến trải
        nghiệm mua sắm tuyệt vời và đáp ứng mọi nhu cầu của khách hàng.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Lịch sử phát triển
      </Typography>
      <Typography variant="body1" paragraph>
        Thành lập từ năm 2010, chúng tôi đã không ngừng phát triển và mở rộng
        danh mục sản phẩm để phục vụ khách hàng trên toàn quốc. Với đội ngũ nhân
        viên giàu kinh nghiệm và đam mê, chúng tôi cam kết mang đến những giá
        trị tốt nhất cho khách hàng.
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Cam kết của chúng tôi
      </Typography>
    </div>
  );
};

export default AboutPage;
