<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="100px">
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
      <el-form-item label="经销商名称" prop="goodsInfoVo.dealer.dealerName">
        <el-input
          v-model="queryParams.goodsInfoVo.dealer.dealerName"
          placeholder="请输入经销商名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
        <el-form-item label="商品货号" prop="goodsInfoVo.commodityGoodsCode">
          <el-input
            v-model="queryParams.goodsInfoVo.commodityGoodsCode"
            placeholder="请输入经销商名称"
            clearable
            size="small"
            @keyup.enter.native="handleQuery"
          />
      </el-form-item>
        <el-form-item label="商品名称" prop="goodsInfoVo.commodityName">
          <el-input
            v-model="queryParams.goodsInfoVo.commodityName"
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
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['marketing:recommendgoods:add']"
        >添加商品</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="recommendgoodsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="地区" align="center" :formatter="handleActivityArea"/>
      <el-table-column label="商品货号" align="center" prop="goodsInfoVo.commodityGoodsCode" />
      <el-table-column label="商品名称" align="center" prop="goodsInfoVo.commodityName" />
      <el-table-column label="经销商" align="center" prop="goodsInfoVo.dealer.dealerName" />
      <el-table-column label="商品原价（元）" align="center" prop="goodsInfoVo.commodityPrice" />
      <el-table-column label="商品库存" align="center" prop="goodsInfoVo.commodityStock" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['marketing:recommendgoods:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['marketing:recommendgoods:remove']"
          >删除</el-button>
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

    <!-- 添加或修改首页推荐商品对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col>
            <el-form-item label="推荐排序" prop="recommendSort">
              <el-input-number v-model="form.recommendSort" :controls="false"/>
            </el-form-item>
          </el-col>
          <el-col>
          <el-form-item label="推荐关键词" prop="recommendKeyword">
            <el-input v-model="form.recommendKeyword"/>
          </el-form-item>
          </el-col>
          <el-col>
          <el-form-item label="推荐状态">
            <el-radio-group v-model="form.recommendStatus">
              <el-radio
                v-for="dict in recommendStatusOptions"
                :key="dict.dictValue"
                :label="dict.dictValue"
              >{{dict.dictLabel}}</el-radio>
            </el-radio-group>
          </el-form-item>
          </el-col>
        </el-row>



      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <recommend-goods-list ref="list" @ok="handleListOK"></recommend-goods-list>
  </div>
</template>

<script>
import { listRecommendgoods, getRecommendgoods, delRecommendgoods, addRecommendgoods, updateRecommendgoods } from "@/api/marketing/recommendgoods";
import recommendGoodsList from "../../commodityinfo/recommendGoodsList";
import {CodeToText, provinceAndCityData} from "element-china-area-data";

export default {
  name: "Recommendgoods",
  components: {recommendGoodsList},
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
      // 首页推荐商品表格数据
      recommendgoodsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 推荐状态字典
      recommendStatusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        goodsInfoVo: {
          commodityGoodsCode: null,
          commodityName: null,
          dealer:{
            dealerName: null,
          }
        }
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
    this.getDicts("sys_show_hide").then(response => {
      this.recommendStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询首页推荐商品列表 */
    getList() {
      this.loading = true;
      //获取当前选择的市，进行模糊查询
      if (this.tempCity != null) {
        this.queryParams.searchValue = CodeToText[this.tempCity[this.tempCity.length-1]]
      } else {
        this.queryParams.searchValue = null;
      }
      listRecommendgoods(this.queryParams).then(response => {
        this.recommendgoodsList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 推荐状态字典翻译
    recommendStatusFormat(row, column) {
      return this.selectDictLabel(this.recommendStatusOptions, row.recommendStatus);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        recommendId: null,
        recommendGoodsId: null,
        recommendSort: null,
        recommendKeyword: null,
        recommendStatus: "0"
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
      this.ids = selection.map(item => item.recommendId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      /*this.reset();
      this.open = true;
      this.title = "添加首页推荐商品";*/
      //ref 写在标签上时：this.$refs.名字  获取的是标签对应的dom元素 ref 写在组件上时：这时候获取到的是 子组件（比如counter）的引用
      //子组件方法
      this.$refs.list.show()
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const recommendId = row.recommendId || this.ids
      getRecommendgoods(recommendId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改首页推荐商品";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.recommendId != null) {
            updateRecommendgoods(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addRecommendgoods(this.form).then(response => {
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
      const recommendIds = row.recommendId || this.ids;
      this.$confirm('是否确认删除首页推荐商品编号为"' + recommendIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delRecommendgoods(recommendIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('marketing/recommendgoods/export', {
        ...this.queryParams
      }, `marketing_recommendgoods.xlsx`)
    },

    //活动地区截取 经销商地区截出市名称
    handleActivityArea(row, column, cellValue, index) {
      const data = row.goodsInfoVo.dealer.dealerArea;
      return data.substring(data.indexOf('省')+1,data.indexOf('市')+1 )
    },

    /** list界面回调*/
    handleListOK(ids) {
      if (ids != null && ids != '')
      addRecommendgoods({remark: ids}).then(response => {
        if (response.code === 200) {
          this.msgSuccess("新增成功");
          this.open = false;
          this.getList();
        }
      });
    }
  }
};
</script>
