import { Table } from 'antd';

const ProductTable = ({
  tableProps,
  loading,
  columns,
  categories,
  onTableChange,
  meta,
  page,
  pageSize,
}) => {
  return (
    <Table
      rowKey="_id"
      {...tableProps}
      loading={loading}
      columns={columns}
      dataSource={categories}
      onChange={onTableChange}
      pagination={{
        total: meta?.totalItems || 0,
        current: meta?.currentPage || page,
        pageSize: meta?.itemsPerPage || pageSize,
        showSizeChanger: true,
        showTotal: (t) => `${t} sản phẩm`,
      }}
      scroll={{ x: '100%', y: 600 }}
    />
  );
};

export default ProductTable;
