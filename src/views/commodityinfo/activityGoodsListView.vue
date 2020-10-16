<template>
  <div class="app-container">
    <el-dialog :title="title" :visible.sync="open" width="800px" top="5vh" append-to-body>
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
        <el-form-item label="经销商地区">
          <el-cascader
            :options="options"
            :props="props"
            v-model="tempCity"
            :collapse-tags="false"
            show-all-levels
            filterable
            clearable></el-cascader>
        </el-form-item>
        <el-form-item label="经销商名称">
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
      <el-table v-loading="loading" :data="commodityInfoList" @selection-change="handleSelectionChange">
        <el-table-column label="序号" width="60px" align="center" header-align="center">
          <template slot-scope="scope">
            <el-radio :label="scope.$index+1" v-model="templateRadio"
                      @change.native="getTemplateRow(scope.$index,scope.row)" style="margin-left:10px;">&nbsp;
            </el-radio>
          </template>
        </el-table-column>

        <el-table-column label="经销商名称" align="center" prop="dealer.dealerName"/>
        <el-table-column label="经销商地址" align="center" prop="dealer.dealerAddress"/>
        <el-table-column label="商品名称" align="center" prop="commodityName"/>
        <el-table-column label="商品货号" align="center" prop="commodityGoodsCode"/>
        <el-table-column label="商品分类" align="center" prop="commodityType"/>
        <el-table-column label="商品价格" align="center" prop="commodityPrice"/>
        <el-table-column label="商品规格" align="center" prop="commodityCapacity" />
        <el-table-column label="商品库存" align="center" prop="commodityStock"/>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleAddActivityGoods">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
      />
    </el-dialog>
  </div>
</template>

<script>
  import {
    listCommodityInfoByActivity } from "@/api/system/dealerCommodityInfo";

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
        title: "选择商品",
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
          commodityStatus: 1,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
        },

        //选中数据对象
        templateSelection:{},
        //是否被选中，默认都是否
        templateRadio: false,
      };
    },
    created() {

      this.getDicts("sys_yes_no").then(response => {
        this.commodityIsReleaseOptions = response.data;
      });
      this.getDicts("sys_yes_no").then(response => {
        this.commodityIsMemberOptions = response.data;
      });
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

        listCommodityInfoByActivity(this.queryParams).then(response => {
          this.commodityInfoList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },

      // 审核状态
      commodityStatusFormat(commodityStatus) {
        switch (commodityStatus) {
          case 1 : return '审批通过';
          case 2 : return '审批未通过';
          default : return '待审批';
        }
      },
      // 是否上架字典翻译
      commodityIsReleaseFormat(row, column) {
        return this.selectDictLabel(this.commodityIsReleaseOptions, row.commodityIsRelease);
      },
      // 是否会员字典翻译
      commodityIsMemberFormat(row, column) {
        return this.selectDictLabel(this.commodityIsMemberOptions, row.commodityIsMember);
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

      //弹出层打开
      show() {
        this.getList();
        this.open = true;
      },

      //获取选中数据
      getTemplateRow(index,row){
        this.templateSelection = row;
      },

      handleAddActivityGoods() {
        this.$emit('ok', this.templateSelection);
        this.open = false;
      }
    }
  };
</script>
