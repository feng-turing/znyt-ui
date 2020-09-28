<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-row>
        <el-form-item label="订单号" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="请输入订单号"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

        <el-form-item label="支付方式" prop="orderPayWay">
          <el-select v-model="queryParams.orderPayWay" placeholder="请输入支付方式" clearable size="small">
            <el-option
              v-for="dict in orderPayWayOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单状态" prop="orderStatus">
          <el-select v-model="queryParams.orderStatus" placeholder="请选择订单状态" clearable size="small">
            <el-option
              v-for="dict in orderStatusOptions"
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
      </el-row>
     <!-- <el-row>
        <el-form-item label="订单用户主键" prop="orderUserId">
          <el-input
            v-model="queryParams.orderUserId"
            placeholder="请输入订单用户主键"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单经销商主键" prop="orderDealerId">
          <el-input
            v-model="queryParams.orderDealerId"
            placeholder="请输入订单经销商主键"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>
        <el-form-item label="订单商品主键" prop="orderCommodityId">
          <el-input
            v-model="queryParams.orderCommodityId"
            placeholder="请输入订单商品主键"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
        </el-form-item>

      </el-row>-->
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!--<el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:order:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:order:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:order:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:order:export']"
        >导出</el-button>
      </el-col>-->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="订单号" align="center" prop="orderNo" />
      <el-table-column label="订单用户" align="center" prop="userMember.userName" />
      <el-table-column label="订单经销商" align="center" prop="dealer.dealerName" />
      <el-table-column label="订单商品" align="center" prop="commodity.commodityName" />
      <el-table-column label="订单原价" align="center" prop="orderOriginalPrice" />
      <el-table-column label="订单实收" align="center" prop="orderRealPrice" />
      <el-table-column label="支付方式" align="center" prop="orderPayWay" :formatter="orderPayWayFormat" />
      <el-table-column label="订单创建时间" align="center" prop="orderCreateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.orderCreateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单提货时间" align="center" prop="orderExtractTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.orderExtractTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus" :formatter="orderStatusFormat" />
      <el-table-column label="订单备注" align="center" prop="orderRemark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-search"
            @click="handleDetail(scope.row.orderId)"
          >查看详情</el-button>

         <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:order:edit']"
          >修改</el-button>-->
         <!-- <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:order:remove']"
          >删除</el-button>-->
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

    <!-- 添加或修改订单信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="订单用户主键" prop="orderUserId">
          <el-input v-model="form.orderUserId" placeholder="请输入订单用户主键" />
        </el-form-item>
        <el-form-item label="订单经销商主键" prop="orderDealerId">
          <el-input v-model="form.orderDealerId" placeholder="请输入订单经销商主键" />
        </el-form-item>
        <el-form-item label="订单商品主键" prop="orderCommodityId">
          <el-input v-model="form.orderCommodityId" placeholder="请输入订单商品主键" />
        </el-form-item>
        <el-form-item label="订单原价" prop="orderOriginalPrice">
          <el-input v-model="form.orderOriginalPrice" placeholder="请输入订单原价" />
        </el-form-item>
        <el-form-item label="订单实收" prop="orderRealPrice">
          <el-input v-model="form.orderRealPrice" placeholder="请输入订单实收" />
        </el-form-item>
        <el-form-item label="支付方式" prop="orderPayWay">
          <el-input v-model="form.orderPayWay" placeholder="请输入支付方式" />
        </el-form-item>
        <el-form-item label="订单创建时间" prop="orderCreateTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.orderCreateTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择订单创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单提货时间" prop="orderExtractTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.orderExtractTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择订单提货时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-radio-group v-model="form.orderStatus">
            <el-radio
              v-for="dict in orderStatusOptions"
              :key="dict.dictValue"
              :label="parseInt(dict.dictValue)"
            >{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="订单备注" prop="orderRemark">
          <el-input v-model="form.orderRemark" placeholder="请输入订单备注" />
        </el-form-item>
        <el-form-item label="第三方支付订单号" prop="payOrderNo">
          <el-input v-model="form.payOrderNo" placeholder="请输入第三方支付订单号" />
        </el-form-item>
        <el-form-item label="订单支付账户" prop="payAccount">
          <el-input v-model="form.payAccount" placeholder="请输入订单支付账户" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/system/order";

export default {
  name: "Order",
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
      // 订单信息表格数据
      orderList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 支付方式字典
      orderPayWayOptions: [],
      // 订单状态字典
      orderStatusOptions: [],
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
    this.getList();
    this.getDicts("pay_type").then(response => {
      this.orderPayWayOptions = response.data;
    });
    this.getDicts("order_status").then(response => {
      this.orderStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询订单信息列表 */
    getList() {
      this.loading = true;
      listOrder(this.queryParams).then(response => {
        this.orderList = response.rows;
        this.total = response.total;
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
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        orderId: null,
        orderNo: null,
        orderUserId: null,
        orderDealerId: null,
        orderCommodityId: null,
        orderOriginalPrice: null,
        orderRealPrice: null,
        orderPayWay: null,
        orderCreateTime: null,
        orderExtractTime: null,
        orderStatus: 0,
        orderRemark: null,
        payOrderNo: null,
        payAccount: null
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加订单信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const orderId = row.orderId || this.ids
      getOrder(orderId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改订单信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.orderId != null) {
            updateOrder(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addOrder(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const orderIds = row.orderId || this.ids;
      this.$confirm('是否确认删除订单信息编号为"' + orderIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delOrder(orderIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/order/export', {
        ...this.queryParams
      }, `system_order.xlsx`)
    },

    handleDetail(orderId) {
      this.$router.push({ path: "/order/detail", query: {orderId: orderId}})
    }
  }
};
</script>
