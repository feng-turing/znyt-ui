<template>
  <div class="app-container">
    <div>
      <el-steps :active="formatStepStatus(order.orderStatus)" finish-status="success" simple style="margin-top: 20px">
        <el-step title="提交订单" ></el-step>
        <el-step title="支付定金" ></el-step>
        <el-step title="支付尾款" ></el-step>
        <el-step title="取货完成" ></el-step>
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
          <el-col :span="8" class="table-cell-title">订单编号</el-col>
          <el-col :span="4" class="table-cell-title">用户名</el-col>
          <el-col :span="4" class="table-cell-title">联系人姓名</el-col>
          <el-col :span="4" class="table-cell-title">手机号</el-col>
          <el-col :span="4" class="table-cell-title">地址</el-col>
        </el-row>
        <el-row>
          <el-col :span="8" class="table-cell">{{order.orderNo}}</el-col>
          <el-col :span="4" class="table-cell">{{order.orderUserName}}</el-col>
          <el-col :span="4" class="table-cell">{{order.orderContactName}}</el-col>
          <el-col :span="4" class="table-cell">{{order.orderContactPhone}}</el-col>
          <el-col :span="4" class="table-cell">{{order.orderAddressDetail}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="8" class="table-cell-title">支付方式</el-col>
          <el-col :span="4" class="table-cell-title">店铺名称</el-col>
          <el-col :span="4" class="table-cell-title">定金支付时间</el-col>
          <el-col :span="4" class="table-cell-title">尾款支付时间</el-col>
          <el-col :span="4" class="table-cell-title">取货时间</el-col>
        </el-row>
        <el-row>
          <el-col :span="8" class="table-cell">{{order.depositPayWay}} - {{order.restPayWay}}</el-col>
          <el-col :span="4" class="table-cell">{{order.orderBelongShopName}}</el-col>
          <el-col :span="4" class="table-cell">{{order.payDepositTime}}</el-col>
          <el-col :span="4" class="table-cell">{{order.payRestTime}}</el-col>
          <el-col :span="4" class="table-cell">{{order.orderExtractTime}}</el-col>
        </el-row>

      </div>

      <div style="margin-top: 20px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">预售信息</span>
      </div>

      <div class="table-layout">
        <el-row>
          <el-col :span="8" class="table-cell-title">预售标题</el-col>
          <el-col :span="4" class="table-cell-title">定金</el-col>
          <el-col :span="4" class="table-cell-title">尾款</el-col>
          <el-col :span="4" class="table-cell-title">数量</el-col>
          <el-col :span="4" class="table-cell-title">合计</el-col>
        </el-row>

        <el-row>
          <el-col :span="8" class="table-cell">{{order.preTitle}}</el-col>
          <el-col :span="4" class="table-cell">{{order.preDepositMoney}}</el-col>
          <el-col :span="4" class="table-cell">{{order.preRestMoney}}</el-col>
          <el-col :span="4" class="table-cell">1</el-col>
          <el-col :span="4" class="table-cell">{{order.preDepositMoney + order.preRestMoney}}</el-col>
        </el-row>
      </div>
      <div style="float: right;margin: 20px">
        合计：<span class="color-danger">{{order.preDepositMoney + order.preRestMoney}}</span>
      </div>

      <div style="margin-top: 60px">
        <svg-icon icon-class="marker" style="color: #606266"></svg-icon>
        <span class="font-small">费用信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="8" class="table-cell-title">定金</el-col>
          <el-col :span="8" class="table-cell-title">尾款</el-col>
          <el-col :span="8" class="table-cell-title">订单总金额</el-col>
        </el-row>
        <el-row>
          <el-col :span="8" class="table-cell">{{order.depositMoney}}</el-col>
          <el-col :span="8" class="table-cell">{{order.restMoney}}</el-col>
          <el-col :span="8" class="table-cell">{{order.orderTotalMoney}}</el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>
<script>
import { getPreOrder } from '@/api/system/preOrder'

export default {
  name: "PreOrderDetail",
  data() {
    return {
      //折叠面板显示
      //步骤图显示
      active: 0,
      // 订单状态字典
      preOrderStatusOptions: [],
      //订单信息
      order: {

      },
    };
  },
  created() {
    const orderId = this.$route.query && this.$route.query.orderId;
    this.getDicts("pre_order_status").then(response => {
      this.preOrderStatusOptions = response.data;
    });
    this.getList(orderId);
  },
  methods: {
    /** 查询订单信息列表 */
    getList(orderId) {
      this.loading = true;
      getPreOrder(orderId).then(response => {
        if (response.code === 200) {
          this.order = response.data;
        }
        this.loading = false;
      });
    },
    //步骤条到哪步
    formatStepStatus(value) {
      switch (value) {
        case 0 : return  1;break;
        case 1 : return  2;break;
        case 2 : return  3;break;
        case 3 : return  4;break;
        default : return  0;break;
      }
    },
    orderStatusFormat(orderStatus) {
      return this.selectDictLabel(this.preOrderStatusOptions, orderStatus);
    },
  }
};
</script>
<style scoped>
.operate-container {
  background: #F2F6FC;
  height: 80px;
  margin: -20px -20px 0;
  line-height: 80px;
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
