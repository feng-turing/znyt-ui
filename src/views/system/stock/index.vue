<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="产品编号" prop="commodityName">
        <el-input
          v-model="queryParams.commodityGoodsCode"
          placeholder="请输入产品编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品名称" prop="commodityName">
        <el-input
          v-model="queryParams.commodityName"
          placeholder="请输入产品名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="stock" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <el-table-column label="产品编号" align="center" prop="commodityGoodsCode"/>
      <el-table-column label="产品名称" align="center" prop="commodityName"/>
      <el-table-column label="产品规格" align="center" prop="commodityCapacity" />
      <el-table-column label="类别" align="center" prop="commodityType"/>
      <el-table-column label="商品库存" align="center" prop="commodityStock"/>

    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
import {
  listStockInfo } from "@/api/system/stock";
import {getToken} from "@/utils/auth";

export default {
  name: "CommodityInfo",
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
      // 自营商品信息表格数据
      stock: [],
      // 弹出层标题
      title: "",
      //经销商选择
      dealerOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 是否会员 默认空
      isMember: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        commodityName: null,
        commodityGoodsCode: null,
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
  },
  methods: {
    /** 查询自营商品信息列表 */
    getList() {
      this.loading = true;
      listStockInfo(this.queryParams).then(response => {
        this.stock = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },

    // 取消按钮
    cancel() {
      this.open = false;
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
      this.ids = selection.map(item => item.commodityId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('system/commodityInfo/export', {
        ...this.queryParams
      }, `system_commodityInfo.xlsx`)
    },

  }
};
</script>
