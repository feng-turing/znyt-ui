<template>
  <div class="app-container">
    <div>
      <el-steps :active="formatStepStatus(order.orderStatus)" finish-status="success" simple style="margin-top: 20px">
        <el-step title="提交订单" ></el-step>
        <el-step title="支付订单" ></el-step>
        <el-step title="确认收货" ></el-step>
        <el-step title="完成评价" ></el-step>
      </el-steps>
    </div>
    <el-card shadow="never" style="margin-top: 15px">
      <div class="operate-container">
        <i class="el-icon-warning color-danger" style="margin-left: 20px"></i>
        <span class="color-danger">当前订单状态：<span v-html="orderStatusFormat(order.orderStatus)"></span></span>
      </div>
      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">基本信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="4" class="table-cell-title">订单编号</el-col>
          <el-col :span="3" class="table-cell-title">用户名称</el-col>
          <el-col :span="4" class="table-cell-title">手机号</el-col>
          <el-col :span="3" class="table-cell-title">支付方式</el-col>
          <el-col :span="4" class="table-cell-title">商家地址</el-col>
          <el-col :span="3" class="table-cell-title">下单时间</el-col>
          <el-col :span="3" class="table-cell-title">取货时间</el-col>
        </el-row>
        <el-row>
          <el-tooltip class="item" effect="dark" :content="order.orderNo" placement="top">
            <el-col :span="4" class="table-cell" >{{order.orderNo}}</el-col>
          </el-tooltip>
          <el-col :span="3" class="table-cell">{{order.userMember.userId}}</el-col>
          <el-col :span="4" class="table-cell">{{order.userMemberAddressVo.phone}}</el-col>
          <el-col :span="3" class="table-cell">{{orderPayWayFormat(order.orderPayWay)}}</el-col>
          <el-tooltip class="item" effect="dark" :content="order.dealer.dealerArea+''+order.dealer.dealerAddress" placement="top">
            <el-col :span="4" class="table-cell">{{order.dealer.dealerArea+''+order.dealer.dealerAddress}}</el-col>
          </el-tooltip>
          <el-col :span="3" class="table-cell">{{order.orderCreateTime}}</el-col>
          <el-col :span="3" class="table-cell">{{order.orderExtractTime}}</el-col>

        </el-row>

      </div>

      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">商品信息</span>
      </div>
      <!--<el-table
        :data="order.cartInfoList"
        size="small"
        style="width: 100%;margin-top: 20px" >
        <el-table-column label="商品图片" width="150" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.cartInfoMap.productInfo.attrInfo.image" style="height: 80px">
          </template>
        </el-table-column>
        <el-table-column label="商品名称" width="300" align="center">
          <template slot-scope="scope">
            <p>{{scope.row.cartInfoMap.productInfo.storeName}}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="240" align="center">
          <template slot-scope="scope">
            <p>价格：￥{{scope.row.cartInfoMap.productInfo.attrInfo.price}}</p>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="240" align="center">
          <template slot-scope="scope">
            {{scope.row.cartInfoMap.productInfo.attrInfo.sku}}
          </template>
        </el-table-column>
        <el-table-column label="数量" width="180" align="center">
          <template slot-scope="scope">
            {{scope.row.cartInfoMap.cartNum}}
          </template>
        </el-table-column>
        <el-table-column label="小计"  align="center">
          <template slot-scope="scope">
            ￥{{scope.row.cartInfoMap.truePrice}}
          </template>
        </el-table-column>
      </el-table>
            <div style="float: right;margin: 20px">
        合计：<span class="color-danger">￥1</span>
      </div>-->
      <el-table
        :data="order.orderCommodity"
        size="small"
        style="width: 100%;margin-top: 20px" @cell-click="handleAvatarView">
        <el-table-column label="商品图片" width="150" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.commodityImg" style="height: 50px">
          </template>
        </el-table-column>
        <el-table-column label="商品名称" width="300" align="center">
          <template slot-scope="scope">
            <p>{{scope.row.commodityName}}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="240" align="center">
          <template slot-scope="scope">
            <p>价格：￥{{scope.row.commodityPrice}}</p>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="240" align="center">
          <template slot-scope="scope">
            <p>{{scope.row.commodityCapacity}}</p>
          </template>
        </el-table-column>
        <el-table-column label="数量" width="180" align="center">
          <template slot-scope="scope">
            <p>{{scope.row.commoditySum}}</p>
          </template>
        </el-table-column>
        <el-table-column label="小计"  align="center">
          <template slot-scope="scope">
            <p>￥{{handleLineMoney(scope.row)}}</p>
          </template>
        </el-table-column>
      </el-table>
      <div style="float: right;margin: 20px">
        合计：<span class="color-danger">￥{{orderGoodsTotalPrice}}</span>
      </div>

      <div style="margin-top: 60px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">费用信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="5" class="table-cell-title">商品合计</el-col>
          <el-col :span="5" class="table-cell-title">优惠券</el-col>
          <el-col :span="4" class="table-cell-title">活动优惠</el-col>
          <el-col :span="4" class="table-cell-title">会员优惠</el-col>
          <el-col :span="6" class="table-cell-title">应付款金额</el-col>
        </el-row>
        <el-row>
          <el-col :span="5" class="table-cell">￥{{order.orderFee.feeTotal}}</el-col>
          <el-col :span="5" class="table-cell">-￥{{order.orderFee.feeDiscount}}</el-col>
          <el-col :span="4" class="table-cell">-￥{{order.orderFee.feeActivity}}</el-col>
          <el-col :span="4" class="table-cell">-￥{{order.orderFee.feeMember}}</el-col>
          <el-col :span="6" class="table-cell">￥{{order.orderFee.feePayMoney}}</el-col>
        </el-row>
      </div>
    </el-card>
    <el-dialog :visible.sync="dialogVisible" :modal="false">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>
<script>
  import { listOrder, getOrder, delOrder, addOrder, updateOrder, getOrderDetail } from "@/api/system/order";
  import { formatDate, formatTime, getQueryObject,} from "@/utils";

  export default {
    name: "Order",
    data() {
      return {
        //订单商品总价
        orderGoodsTotalPrice : 0,
        //看图使用
        dialogVisible: false,
        dialogImageUrl: '',
        //折叠面板显示
        //步骤图显示
        active: 0,
        // 支付方式字典
        orderPayWayOptions: [],
        // 订单状态字典
        orderStatusOptions: [],
        //订单信息
        order: {
          dealer: {},
          orderCommodity: [],
          orderFee: {},
          userMember: {},
          userMemberAddressVo: {}
        },
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
          if (response.code === 200) {
            //累加所有订单商品
            this.orderGoodsTotalPrice = this.order.orderCommodity.reduce((e,q)=>{
               return e + (q.commodityPrice*q.commoditySum);
            }, 0);
            this.order = response.data;
          }
          this.loading = false;
        });
      },

      //步骤条到哪步
      //订单状态(0:待付款,1:待取货,2:已完成,3:已评价,4:已退款,10:已预约)
      formatStepStatus(value) {
        switch (value) {
          case 0 : return  1;break;
          case 1 : return  2;break;
          case 2 : return  3;break;
          case 3 : return  4;break;
          default : return  0;break;
        }
      },

      // 支付方式字典翻译
      orderPayWayFormat(orderPayWay) {
        return this.selectDictLabel(this.orderPayWayOptions, orderPayWay);
      },
      // 订单状态字典翻译
      orderStatusFormat(orderStatus) {
        return this.selectDictLabel(this.orderStatusOptions, orderStatus);
      },
      handleLineMoney(row, column){
        return parseFloat(row.commoditySum * row.commodityPrice).toFixed(2);
      },

      handleAvatarView(row, column, cell, event) {
        if (column.label === '商品图片') {
          this.dialogImageUrl = row.commodityImg;
          this.dialogVisible = true;
        }
      },

    }
  };
</script>
<style scoped>
  .detail-container {
    width: 80%;
    padding: 20px 20px 20px 20px;
    margin: 20px auto;
  }

  .operate-container {
    background: #F2F6FC;
    height: 80px;
    margin: -20px -20px 0;
    line-height: 80px;
  }

  .operate-button-container {
    float: right;
    margin-right: 20px
  }

  .table-layout {
    margin-top: 20px;
    border-left: 1px solid #DCDFE6;
    border-top: 1px solid #DCDFE6;
  }

  .table-cell {
    height: 60px;
    line-height: 40px;
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    font-size: 14px;
    color: #606266;
    text-align: center;
    overflow: hidden;
  }

  .table-cell-title {
    border-right: 1px solid #DCDFE6;
    border-bottom: 1px solid #DCDFE6;
    padding: 10px;
    background: #F2F6FC;
    text-align: center;
    font-size: 14px;
    color: #303133;
  }
</style>
