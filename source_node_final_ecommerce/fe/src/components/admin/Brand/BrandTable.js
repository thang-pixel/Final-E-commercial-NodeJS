import { Table } from 'antd';

const BrandTable = ({
  tableProps,
  loading,
  columns,
  brands,
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
      dataSource={brands}
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

export default BrandTable;
