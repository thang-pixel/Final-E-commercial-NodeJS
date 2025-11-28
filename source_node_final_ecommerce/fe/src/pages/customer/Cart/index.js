import {
  Box,
  Button,
  Container,
  Grid,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import useCart from '../../../hooks/cartHook';
import { useDispatch, useSelector } from 'react-redux';
import { getVariantByIdApi } from '../../../api/productVariantApi';
import { message } from 'antd';
import {
  removeFromCart,
  updateQuantity,
} from '../../../redux/reducers/cartSlice';
import { DeleteForeverOutlined } from '@mui/icons-material';
import currencyUtils from '../../../utils/currencyUtils';

function Cart() {
  const [messageAntd, contextHolder] = message.useMessage();
  const { carts } = useSelector((state) => state.carts);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const handleUpdateQuantity = async (product_id, variant_id, quantity) => {
    if (quantity < 0) return;
    // dispatch update quantity action
    // check in stock before updating

    try {
      const resp = await getVariantByIdApi(variant_id, product_id);
      console.log('Variant check stock resp: ', resp);
      if (quantity > resp.data.stock) {
        messageAntd.error(
          'Số lượng trong kho không đủ, vui lòng giảm số lượng!'
        );
        return;
      }
    } catch (error) {
      console.error('Error checking stock: ', error);
      messageAntd.error(error.message || 'Lỗi khi kiểm tra số lượng trong kho');
      return;
    }

    // ...
    if (isLoggedIn) {
      // update on server
    } else {
      // update in local storage
      dispatch(updateQuantity({ product_id, variant_id, quantity }));
      messageAntd.success('Cập nhật cart số lượng thành công');
    }

    // cập nhật selected variants nếu có
    // setSelectedVariants((prev) => {
    //   if (prev[variant_id]) {
    //     return {
    //       ...prev,
    //       [variant_id]: {
    //         ...prev[variant_id],
    //         quantity,
    //       },
    //     };
    //   }
    //   return prev;
    // });
  };

  const handleDeleteItem = (product_id, variant_id) => {
    // dispatch remove from cart action
    // ...
    if (isLoggedIn) {
      // remove on server
    } else {
      // remove in local storage
      dispatch(removeFromCart({ product_id, variant_id }));
      messageAntd.success('Xoá sản phẩm khỏi giỏ hàng thành công');
    }
  };

  return (
    <>
      <Container maxWidth="lg" className="">
        <h1 className="text-center font-bold capitalize">Cart Page</h1>

      <Box sx={{ width: '100%' }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6">Danh sách sản phẩm</Typography>

            {/* list table */}
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 2,
                boxShadow: 'var(--box-shadow)',
              }}
            >
              <TableContainer>
                <Table sx={{ minWidth: '90%' }}>
                  <TableHead>
                    <TableCell>#</TableCell>
                    <TableCell>Ảnh</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell>Biến thể</TableCell>
                    <TableCell>Giá</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Thao tác</TableCell>
                  </TableHead>

                  <TableBody>
                    {carts.map((item, index) => (
                      <TableRow key={item.variant_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <img
                            src={item.image_url}
                            alt={item.name}
                            style={{
                              width: '70px',
                              height: '70px',
                              objectFit: 'contain',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            SKU: {item.SKU}
                          </div>
                        </TableCell>
                        <TableCell>
                          {Object.values(item.attributes).map((item, index) => (
                            <div key={index}>
                              {item.code}: {item.value}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>
                          {currencyUtils.formatCurrency(item.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center rounded">
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product_id,
                                  item.variant_id,
                                  item.quantity - 1
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product_id,
                                  item.variant_id,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="m-auto">
                            <DeleteForeverOutlined
                              className="cursor-pointer text-red-600"
                              onClick={() =>
                                handleDeleteItem(
                                  item.product_id,
                                  item.variant_id
                                )
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>

          {/* Checkout */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6">Sản phẩm đang chọn</Typography>

            {/* Danh sách sản phẩm đang chọn */}
            <Box
              sx={{
                width: '100%',
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 2,
                boxShadow: 'var(--box-shadow)',
              }}
            >
              {/* <Typography variant="body1">Tổng đơn hàng: {currencyUtils.formatCurrency(totalAmount)}</Typography> */}
              <TableContainer>
                <Table sx={{ minWidth: '90%' }}>
                  <TableHead>
                    <TableCell>STT</TableCell>
                    <TableCell>Tên sản phẩm</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Thành tiền</TableCell>
                  </TableHead>
                  <TableBody>
                    {carts.map((item, index) => (
                      <TableRow key={item.variant_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          {currencyUtils.formatCurrency(item.price)}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {currencyUtils.formatCurrency(
                            item.price * item.quantity
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Summary */}
            <Box
              sx={{
                backgroundColor: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 2,
                boxShadow: 'var(--box-shadow)',
              }}
            ></Box>
          </Grid>
        </Grid>
      </Box>
      </Container>
    </>
  );
}

export default Cart;
