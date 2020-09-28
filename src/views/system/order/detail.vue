<template>
  <div class="app-container">
    <el-steps :active="active" finish-status="success" simple style="margin-top: 20px">
      <el-step title="提交订单" ></el-step>
      <el-step title="支付订单" ></el-step>
      <el-step title="确认收货" ></el-step>
      <el-step title="完成评价" ></el-step>
    </el-steps>

    <el-collapse v-model="activeNames" >
      <el-collapse-item title="基本信息" name="1" >
        <el-table v-loading="loading" :data="orderList" >
          <el-table-column label="订单编号" align="center" prop="orderNo" />
          <el-table-column label="用户名称" align="center" prop="userMember.userName" />
          <el-table-column label="手机号" align="center" prop="userMember.userPhonenumber" />
          <el-table-column label="支付方式" align="center" prop="orderPayWay"  :formatter="orderPayWayFormat"/>
          <el-table-column label="商家地址" align="center" prop="dealer.dealerAddress" />
          <el-table-column label="下单时间" align="center" prop="orderCreateTime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.orderCreateTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="取货时间" align="center" prop="orderExtractTime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.orderExtractTime, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="订单状态" align="center" prop="orderStatus" :formatter="orderStatusFormat" />
          <el-table-column label="订单备注" align="center" prop="orderRemark" />
        </el-table>
      </el-collapse-item>
      <el-collapse-item title="商品信息" name="2">
        <el-table v-loading="loading" :data="commodityInfoList" @cell-click="handleAvatarView">
          <el-table-column label="商品图片" align="center" prop="commodityImg" >
            <template slot-scope="scope">
              <el-image
                style="width: 50px; height: 50px"
                :src="scope.row.commodityImg"></el-image>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" align="center" prop="commodityName"/>
          <el-table-column label="商品价格" align="center" prop="commodityPrice"/>
          <el-table-column label="商品规格" align="center" prop="commodityCapacity" />
          <el-table-column label="数量" align="center" prop="commoditySum" />
          <el-table-column label="小计" align="center" :formatter="handleLineMoney"/>
        </el-table>
      </el-collapse-item>
      <el-collapse-item title="费用信息" name="3">
        <el-table v-loading="loading" :data="feeInfoList">
          <el-table-column label="商品合计" align="center" prop="feeTotal"/>
          <el-table-column label="优惠卷" align="center" prop="feeDiscount"/>
          <el-table-column label="活动优惠" align="center" prop="feeActivity" />
          <el-table-column label="会员优惠" align="center" prop="feeMember" />
          <el-table-column label="应付款金额" align="center" prop="feePayMoney" />
        </el-table>
      </el-collapse-item>

    </el-collapse>

    <el-dialog :visible.sync="dialogVisible" :modal="false">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>

</template>
<script>
import { listOrder, getOrder, delOrder, addOrder, updateOrder, getOrderDetail } from "@/api/system/order";

export default {
  name: "Order",
  data() {
    return {
      //看图使用
      dialogVisible: false,
      dialogImageUrl: '',
      //折叠面板显示
      activeNames: ['1','2','3'],
      //步骤图显示
      active: 0,
      // 支付方式字典
      orderPayWayOptions: [],
      // 订单状态字典
      orderStatusOptions: [],
      //订单信息
      orderList:[],
      //商品信息
      commodityInfoList:[],

      feeInfoList:[],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: null,
        orderUserId: null,
        orderDealerId: null,
        orderCommodityId: null,
        orderPayWay: null,
        orderStatus: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    const orderId = this.$route.query && this.$route.query.orderId;
    this.getDicts("pay_type").then(response => {
      this.orderPayWayOptions = response.data;
    });
    this.getDicts("order_status").then(response => {
      this.orderStatusOptions = response.data;
    });
    this.getList(orderId);
  },
  methods: {
    /** 查询订单信息列表 */
    getList(orderId) {
      this.loading = true;
      getOrderDetail(orderId).then(response => {
        this.orderList.push(response.data);
        this.commodityInfoList.push(response.data.orderCommodity);
        this.feeInfoList.push(response.data.orderFee);
         if(response.data.orderStatus) {

        }
         //订单状态(0:待付款,1:待取货,2:已完成,3:已评价,4:已退款,10:已预约)
         switch (response.data.orderStatus) {
            case 0 : this.active = 1;break;
            case 1 : this.active = 2;break;
            case 2 : this.active = 3;break;
            case 3 : this.active = 4;break;
            default : this.active = 0;break;
         }
        this.loading = false;
      });

    },
    // 支付方式字典翻译
    orderPayWayFormat(row, column) {
      return this.selectDictLabel(this.orderPayWayOptions, row.orderPayWay);
    },
    // 订单状态字典翻译
    orderStatusFormat(row, column) {
      return this.selectDictLabel(this.orderStatusOptions, row.orderStatus);
    },
    handleLineMoney(row, column){
      return parseFloat(row.commoditySum * row.commodityPrice).toFixed(2);
    },

    handleAvatarView(row, column, cell, event) {
      if (column.property === 'commodityImg') {
        this.dialogImageUrl = row.commodityImg;
        this.dialogVisible = true;
      }
    },


  }
};
</script>
