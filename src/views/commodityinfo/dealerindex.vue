<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="经销商地区" >
        <el-cascader
          :options="options"
          :props="props"
          v-model="tempCity"
          :collapse-tags="false"
          show-all-levels
          filterable
          clearable></el-cascader>
      </el-form-item>
      <el-form-item label="经销商名称" >
        <el-input
          v-model="queryParams.dealerName"
          placeholder="请输入经销商名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称">
        <el-input
          v-model="queryParams.commodityName"
          placeholder="请输入商品名称"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-top"
          size="mini"
          @click="handleBatchRelease"
        >批量上架
        </el-button>
        <el-button
          type="danger"
          icon="el-icon-top"
          size="mini"
          @click="handleBatchRelease({}, 'N')"
        >批量下架
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commodityInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <!--      <el-table-column label="经销商id" align="center" prop="dealerId" />-->
      <el-table-column label="经销商名称" align="center" prop="dealer.dealerName"/>
      <el-table-column label="经销商地址" align="center" prop="dealer.dealerAddress"/>
      <el-table-column label="商品名称" align="center" prop="commodityName"/>
      <el-table-column label="商品货号" align="center" prop="commodityGoodsCode"/>
      <el-table-column label="商品分类" align="center" prop="commodityType"/>
      <el-table-column label="商品价格" align="center" prop="commodityPrice"/>
      <el-table-column label="商品规格" align="center" prop="commodityCapacity" />
      <el-table-column label="商品库存" align="center" prop="commodityStock"/>
      <el-table-column label="会员价" align="center" prop="commodityMemberPrice" :formatter="handleMemberPriceFormatter"/>
      <el-table-column label="是否上架" align="center" prop="commodityIsRelease">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.commodityIsRelease === 'Y' ? 'success' : 'danger'"
            disable-transitions>{{commodityIsReleaseFormat(scope.row)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-show="scope.row.commodityIsRelease === 'N'"
                     size="mini"
                     type="text"
                     icon="el-icon-top"
                     @click="handleBatchRelease(scope.row, 'Y')"
          >上架
          </el-button>
          <el-button v-show="scope.row.commodityIsRelease === 'Y'"
                     size="mini"
                     type="text"
                     icon="el-icon-bottom"
                     @click="handleBatchRelease(scope.row, 'N')"
          >下架
          </el-button>
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

  </div>
</template>

<script>
import {
  listDealerCommodityInfo } from "@/api/system/dealerCommodityInfo";
import {
  releaseCommodityInfo } from "@/api/system/stock";
import {CodeToText, provinceAndCityData} from "element-china-area-data";
export default {
  name: "CommodityInfo",
  data() {
    return {
      //地区省市联动
      props: { multiple: false },
      options: provinceAndCityData,
      tempCity: null,

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
      commodityInfoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否上架字典
      commodityIsReleaseOptions: [],
      // 是否会员字典
      commodityIsMemberOptions: [],
      // 商品分类字典
      commodityTypeOptions: [],
      // 是否会员 默认空
      isMember: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        commodityName: null,
        dealerName: null,
        searchValue: null,
        isSelfSupport: 'Y',
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
    this.getDicts("sys_yes_no").then(response => {
      this.commodityIsReleaseOptions = response.data;
    });
    this.getDicts("sys_yes_no").then(response => {
      this.commodityIsMemberOptions = response.data;
    });
    this.queryParams.partnerCommodityId = this.$route.query.id || null;
  },
  methods: {
    /** 查询自营商品信息列表 */
    getList() {
      this.loading = true;
      //获取当前选择的市，进行模糊查询
      if (this.tempCity != null) {
        this.queryParams.searchValue = CodeToText[this.tempCity[this.tempCity.length-1]]
      } else {
        this.queryParams.searchValue = null;
      }

      listDealerCommodityInfo(this.queryParams).then(response => {
        this.commodityInfoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 是否上架字典翻译
    commodityIsReleaseFormat(row, column) {
      return this.selectDictLabel(this.commodityIsReleaseOptions, row.commodityIsRelease);
    },
    // 是否会员字典翻译
    commodityIsMemberFormat(row, column) {
      return this.selectDictLabel(this.commodityIsMemberOptions, row.commodityIsMember);
    },
    // 会员价格初始化
    handleMemberPriceFormatter(row, column, cellValue, index) {
      if (cellValue == 0 ) {
        return '';
      } else {
        return cellValue;
      }
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
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
      this.tempCity= null;
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.commodityId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },


    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除自营商品信息编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delCommodityInfo(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(function () {
      });
    },

    /** 上下架按钮操作 */
    handleBatchRelease(row,status = 'Y') {
      console.log(row);
      const ids = row.commodityId || this.ids.join(',');
      const data = {
        commodityIds: ids,
        commodityIsRelease: status,
      }
      this.$confirm('是否确认将选中数据中商品进行'+(status==='Y'?'上':'下')+'架', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return releaseCommodityInfo(data);
      }).then(() => {
        this.getList();
        this.msgSuccess("上架成功");
      }).catch(function () {
      });
    },

  }
};
</script>
