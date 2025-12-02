const OrderModel = require('../models/OrderModel');
const UserModel = require('../models/UserModel');
const ProductModel = require('../models/ProductModel');
const ProductVariant = require('../models/ProductVariant');
const mongoose = require('mongoose');

// HELPER FUNCTION - Di chuyển ra ngoài class để tránh context issue
const getComparisonData = async (timeframe, currentFilter, year) => {
  let previousFilter = {};
  
  try {
    switch (timeframe) {
      case 'year':
        previousFilter = {
          createdAt: {
            $gte: new Date(year - 1, 0, 1),
            $lt: new Date(year, 0, 1)
          }
        };
        break;
      case 'quarter':
        // Get previous quarter
        const currentQuarter = Math.ceil((new Date(currentFilter.createdAt.$gte).getMonth() + 1) / 3);
        let prevQuarter = currentQuarter - 1;
        let prevYear = year;
        
        if (prevQuarter === 0) {
          prevQuarter = 4;
          prevYear = year - 1;
        }
        
        const prevQuarterStart = new Date(prevYear, (prevQuarter - 1) * 3, 1);
        const prevQuarterEnd = new Date(prevYear, prevQuarter * 3, 1);
        
        previousFilter = {
          createdAt: { $gte: prevQuarterStart, $lt: prevQuarterEnd }
        };
        break;
      case 'month':
        const currentMonth = new Date(currentFilter.createdAt.$gte);
        const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
        const prevMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        previousFilter = {
          createdAt: { $gte: prevMonth, $lt: prevMonthEnd }
        };
        break;
      case 'week':
        const currentWeekStart = new Date(currentFilter.createdAt.$gte);
        const prevWeekStart = new Date(currentWeekStart);
        prevWeekStart.setDate(currentWeekStart.getDate() - 7);
        const prevWeekEnd = new Date(currentWeekStart);
        
        previousFilter = {
          createdAt: { $gte: prevWeekStart, $lt: prevWeekEnd }
        };
        break;
      case 'custom':
        const currentStart = new Date(currentFilter.createdAt.$gte);
        const currentEnd = new Date(currentFilter.createdAt.$lt);
        const duration = currentEnd - currentStart;
        
        const prevStart = new Date(currentStart.getTime() - duration);
        const prevEnd = new Date(currentStart);
        
        previousFilter = {
          createdAt: { $gte: prevStart, $lt: prevEnd }
        };
        break;
      default:
        return { current: {}, previous: {}, growth: {} };
    }

    const [currentData, previousData] = await Promise.all([
      OrderModel.aggregate([
        { $match: currentFilter },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: { $sum: '$total_amount' },
            avgOrderValue: { $avg: '$total_amount' }
          }
        }
      ]),
      OrderModel.aggregate([
        { $match: previousFilter },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: { $sum: '$total_amount' },
            avgOrderValue: { $avg: '$total_amount' }
          }
        }
      ])
    ]);

    const current = currentData[0] || { orders: 0, revenue: 0, avgOrderValue: 0 };
    const previous = previousData[0] || { orders: 0, revenue: 0, avgOrderValue: 0 };

    const growth = {
      orders: previous.orders ? ((current.orders - previous.orders) / previous.orders * 100) : 0,
      revenue: previous.revenue ? ((current.revenue - previous.revenue) / previous.revenue * 100) : 0,
      avgOrderValue: previous.avgOrderValue ? ((current.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue * 100) : 0
    };

    return { current, previous, growth };
  } catch (error) {
    console.error('Error in comparison data:', error);
    return { current: {}, previous: {}, growth: {} };
  }
};

class DashboardController {

  // [GET] /api/dashboard/simple - Simple Dashboard
  async getSimpleDashboard(req, res) {
    try {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      console.log('🔍 Fetching simple dashboard data...');

      // Parallel queries for better performance
      const [
        totalUsers,
        newUsersToday,
        newUsersThisMonth,
        totalOrders,
        ordersToday,
        ordersThisMonth,
        revenue,
        bestSellingProducts,
        recentOrders,
        userGrowth,
        orderStatusDistribution
      ] = await Promise.all([
        // Total users
        UserModel.countDocuments({ role: { $ne: 'admin' } }),
        
        // New users today
        UserModel.countDocuments({ 
          role: { $ne: 'admin' },
          createdAt: { $gte: startOfToday }
        }),
        
        // New users this month
        UserModel.countDocuments({ 
          role: { $ne: 'admin' },
          createdAt: { $gte: startOfMonth }
        }),
        
        // Total orders
        OrderModel.countDocuments(),
        
        // Orders today
        OrderModel.countDocuments({ 
          createdAt: { $gte: startOfToday }
        }),
        
        // Orders this month
        OrderModel.countDocuments({ 
          createdAt: { $gte: startOfMonth }
        }),
        
        // Revenue statistics
        OrderModel.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total_amount' },
              todayRevenue: {
                $sum: {
                  $cond: [
                    { $gte: ['$createdAt', startOfToday] },
                    '$total_amount',
                    0
                  ]
                }
              },
              monthRevenue: {
                $sum: {
                  $cond: [
                    { $gte: ['$createdAt', startOfMonth] },
                    '$total_amount',
                    0
                  ]
                }
              },
              yearRevenue: {
                $sum: {
                  $cond: [
                    { $gte: ['$createdAt', startOfYear] },
                    '$total_amount',
                    0
                  ]
                }
              }
            }
          }
        ]),
        
        // Best selling products (by quantity sold)
        OrderModel.aggregate([
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product_id',
              name: { $first: '$items.name' },
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: '$items.total_price' }
            }
          },
          { $sort: { totalSold: -1 } },
          { $limit: 5 }
        ]),
        
        // Recent orders
        OrderModel.find()
          .populate('customer_id', 'full_name email')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
          
        // User growth chart (last 7 days)
        UserModel.aggregate([
          {
            $match: {
              role: { $ne: 'admin' },
              createdAt: { 
                $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        
        // Order status distribution
        OrderModel.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      const revenueData = revenue[0] || {
        totalRevenue: 0,
        todayRevenue: 0,
        monthRevenue: 0,
        yearRevenue: 0
      };

      console.log('✅ Simple dashboard data fetched successfully');

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            newUsersToday,
            newUsersThisMonth,
            totalOrders,
            ordersToday,
            ordersThisMonth,
            ...revenueData
          },
          charts: {
            bestSellingProducts,
            userGrowth,
            orderStatusDistribution
          },
          recent: {
            orders: recentOrders
          }
        }
      });

    } catch (error) {
      console.error('❌ Error fetching simple dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tải dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // [GET] /api/dashboard/advanced - Advanced Dashboard
  async getAdvancedDashboard(req, res) {
    try {
      const { 
        timeframe = 'year', 
        start_date,
        end_date,
        year = new Date().getFullYear(),
        quarter,
        month
      } = req.query;

      console.log(`🔍 Fetching advanced dashboard for timeframe: ${timeframe}, year: ${year}`);

      let dateFilter = {};
      let groupBy = {};
      
      // Determine date range based on timeframe
      const now = new Date();
      
      switch (timeframe) {
        case 'year':
          dateFilter = {
            createdAt: {
              $gte: new Date(year, 0, 1),
              $lt: new Date(parseInt(year) + 1, 0, 1)
            }
          };
          groupBy = {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          };
          console.log(`📅 Year filter: ${year} - ${parseInt(year) + 1}`);
          break;
          
        case 'quarter':
          const quarterNum = parseInt(quarter) || Math.ceil((now.getMonth() + 1) / 3);
          const quarterStart = new Date(year, (quarterNum - 1) * 3, 1);
          const quarterEnd = new Date(year, quarterNum * 3, 1);
          dateFilter = {
            createdAt: { $gte: quarterStart, $lt: quarterEnd }
          };
          groupBy = {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          };
          console.log(`📅 Quarter filter: Q${quarterNum} ${year}`);
          break;
          
        case 'month':
          const monthNum = parseInt(month) !== undefined ? parseInt(month) : now.getMonth();
          dateFilter = {
            createdAt: {
              $gte: new Date(year, monthNum, 1),
              $lt: new Date(year, monthNum + 1, 1)
            }
          };
          groupBy = {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          };
          console.log(`📅 Month filter: ${monthNum + 1}/${year}`);
          break;
          
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);
          dateFilter = {
            createdAt: { $gte: weekStart, $lt: weekEnd }
          };
          groupBy = {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          };
          console.log(`📅 Week filter: ${weekStart.toDateString()} - ${weekEnd.toDateString()}`);
          break;
          
        case 'custom':
          if (start_date && end_date) {
            dateFilter = {
              createdAt: {
                $gte: new Date(start_date),
                $lt: new Date(new Date(end_date).getTime() + 24 * 60 * 60 * 1000) // Add 1 day to include end_date
              }
            };
            groupBy = {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            };
            console.log(`📅 Custom filter: ${start_date} - ${end_date}`);
          } else {
            // Default to current month if no dates provided
            dateFilter = {
              createdAt: {
                $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
              }
            };
            groupBy = {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            };
          }
          break;
          
        default:
          // Default to current year
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), 0, 1),
              $lt: new Date(now.getFullYear() + 1, 0, 1)
            }
          };
          groupBy = {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          };
      }

      console.log('📊 Date filter applied:', dateFilter);

      // Parallel queries for advanced analytics
      const [
        salesAnalytics,
        revenueAnalytics,
        productAnalytics,
        categoryAnalytics,
        comparisonData,
        topProducts,
        topCategories
      ] = await Promise.all([
        // Sales analytics over time
        OrderModel.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: groupBy,
              orderCount: { $sum: 1 },
              revenue: { $sum: '$total_amount' },
              profit: { $sum: { $subtract: ['$total_amount', '$shipping_fee'] } },
              avgOrderValue: { $avg: '$total_amount' }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        
        // Revenue breakdown
        OrderModel.aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$total_amount' },
              totalOrders: { $sum: 1 },
              avgOrderValue: { $avg: '$total_amount' },
              totalShipping: { $sum: '$shipping_fee' },
              totalDiscount: { $sum: '$discount_amount' }
            }
          }
        ]),
        
        // Product sales analytics
        OrderModel.aggregate([
          { $match: dateFilter },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product_id',
              productName: { $first: '$items.name' },
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: '$items.total_price' },
              orderCount: { $sum: 1 }
            }
          },
          { $sort: { totalSold: -1 } },
          { $limit: 10 }
        ]),
        
        // Category analytics
        OrderModel.aggregate([
          { $match: dateFilter },
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              localField: 'items.product_id',
              foreignField: '_id',
              as: 'product'
            }
          },
          { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'categories',
              localField: 'product.category_id',
              foreignField: '_id',
              as: 'category'
            }
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: '$category._id',
              categoryName: { $first: { $ifNull: ['$category.name', 'Chưa phân loại'] } },
              totalSold: { $sum: '$items.quantity' },
              revenue: { $sum: '$items.total_price' },
              productCount: { $addToSet: '$items.product_id' }
            }
          },
          {
            $project: {
              categoryName: 1,
              totalSold: 1,
              revenue: 1,
              uniqueProducts: { $size: '$productCount' }
            }
          },
          { $sort: { revenue: -1 } }
        ]),
        
        // Comparison with previous period - SỬA: Gọi function độc lập
        getComparisonData(timeframe, dateFilter, year),
        
        // Top performing products
        OrderModel.aggregate([
          { $match: dateFilter },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product_id',
              name: { $first: '$items.name' },
              totalRevenue: { $sum: '$items.total_price' },
              totalQuantity: { $sum: '$items.quantity' },
              avgPrice: { $avg: '$items.price' }
            }
          },
          { $sort: { totalRevenue: -1 } },
          { $limit: 5 }
        ]),
        
        // Top categories by revenue
        OrderModel.aggregate([
          { $match: dateFilter },
          { $unwind: '$items' },
          {
            $lookup: {
              from: 'products',
              localField: 'items.product_id',
              foreignField: '_id',
              as: 'product'
            }
          },
          { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: 'categories',
              localField: 'product.category_id',
              foreignField: '_id',
              as: 'category'
            }
          },
          { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: '$category._id',
              name: { $first: { $ifNull: ['$category.name', 'Chưa phân loại'] } },
              revenue: { $sum: '$items.total_price' },
              quantity: { $sum: '$items.quantity' }
            }
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 }
        ])
      ]);

      console.log(`✅ Advanced dashboard data fetched: 
        - Sales data points: ${salesAnalytics.length}
        - Top products: ${topProducts.length}
        - Top categories: ${topCategories.length}
        - Has comparison: ${!!comparisonData.current}`);

      res.json({
        success: true,
        data: {
          timeframe,
          dateFilter,
          analytics: {
            sales: salesAnalytics,
            revenue: revenueAnalytics[0] || {},
            products: productAnalytics,
            categories: categoryAnalytics,
            comparison: comparisonData,
            topProducts,
            topCategories
          }
        }
      });

    } catch (error) {
      console.error('❌ Error fetching advanced dashboard:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tải dashboard nâng cao',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // [GET] /api/dashboard/stats - Quick stats for header
  async getQuickStats(req, res) {
    try {
      console.log('🔍 Fetching quick stats...');
      
      const [
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders
      ] = await Promise.all([
        UserModel.countDocuments({ role: { $ne: 'admin' } }),
        OrderModel.countDocuments(),
        OrderModel.aggregate([
          { $group: { _id: null, total: { $sum: '$total_amount' } } }
        ]),
        OrderModel.countDocuments({ status: 'PENDING' })
      ]);

      console.log('✅ Quick stats fetched successfully');

      res.json({
        success: true,
        data: {
          totalUsers,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          pendingOrders
        }
      });
    } catch (error) {
      console.error('❌ Error fetching quick stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
}

module.exports = new DashboardController();