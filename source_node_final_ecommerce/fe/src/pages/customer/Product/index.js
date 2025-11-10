import { Grid } from "@mui/material";
import NewProducts from "../home/NewProducts";

const ProductList = () => {

  return (<>
    <h1>Product List Page</h1>
    <Grid container spacing={4} >
          <Grid item size={{xs: 12}} > 
            <NewProducts limit={8} />
          </Grid>
    </Grid>
  </>)
}

export default ProductList;