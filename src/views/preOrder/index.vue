<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="店铺名称" prop="orderBelongShopName">
        <el-input
          v-model="queryParams.orderBelongShopName"
          placeholder="请输入店铺名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户昵称" prop="orderUserName">
        <el-input
          v-model="queryParams.orderUserName"
          placeholder="请输入用户昵称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="订单状态" clearable filterable size="small">
          <el-option
            v-for="dict in preOrderStatusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">

	    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="用户昵称" align="center" prop="orderUserName" />
      <el-table-column label="手机号" align="center" prop="orderContactPhone" />
      <el-table-column label="店铺名称" align="center" prop="orderBelongShopName" />
      <el-table-column label="定金" align="center" prop="depositMoney" />
      <el-table-column label="尾款" align="center" prop="restMoney" />
      <el-table-column label="定金支付时间" align="center" prop="payDepositTime" width="180" />
      <el-table-column label="尾款支付时间" align="center" prop="payRestTime" width="180" />
      <el-table-column label="取货时间" align="center" prop="orderExtractTime" width="180" />
      <el-table-column label="订单状态" align="center" prop="orderStatus" :formatter="preOrderStatusFormat"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handleDetail(scope.row.orderId)"
          >查看订单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改预售订单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPreOrder} from "@/api/system/preOrder";

export default {
  name: "PreOrderList",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 预售订单表格数据
      orderList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderType: null,
        orderNo: null,
        orderUserId: null,
        orderUserName: null,
        orderAddressId: null,
        orderContactName: null,
        orderContactPhone: null,
        orderAddressDetail: null,
        orderCommodityId: null,
        orderBelongShopId: null,
        orderBelongShopName: null,
        depositMoney: null,
        payDepositTime: null,
        depositPayWay: null,
        restMoney: null,
        payRestTime: null,
        restPayWay: null,
        orderTotalMoney: null,
        orderCreateTime: null,
        orderExtractTime: null,
        orderStatus: null,
        orderRemark: null,
        payOrderNo: null,
        payAccount: null,
        orderFrom: null,
        orderAreaCode: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      preOrderStatusOptions:[]
    };
  },
  created() {
    this.getList();
    this.getDicts("pre_order_status").then(response => {
      this.preOrderStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询预售订单列表 */
    getList() {
      this.loading = true;
      listPreOrder(this.queryParams).then(response => {
        this.orderList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        orderId: null,
        orderType: null,
        orderNo: null,
        orderUserId: null,
        orderUserName: null,
        orderAddressId: null,
        orderContactName: null,
        orderContactPhone: null,
        orderAddressDetail: null,
        orderCommodityId: null,
        orderBelongShopId: null,
        orderBelongShopName: null,
        depositMoney: null,
        payDepositTime: null,
        depositPayWay: null,
        restMoney: null,
        payRestTime: null,
        restPayWay: null,
        orderTotalMoney: null,
        orderCreateTime: null,
        orderExtractTime: null,
        orderStatus: 0,
        orderRemark: null,
        payOrderNo: null,
        payAccount: null,
        orderFrom: null,
        orderAreaCode: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.orderId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    preOrderStatusFormat(row, column) {
      return this.selectDictLabel(this.preOrderStatusOptions, row.orderStatus);
    },
    handleDetail(orderId) {
      this.$router.push({ path: "/preOrder/detail", query: {orderId: orderId}})
    }

  }
};
</script>
