<template>
  <div class="app-container">
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
          v-hasPermi="['marketing:activitygoods:add']"
        >添加商品</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activitygoodsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="活动地区" align="center" :formatter="handleActivityArea"/>
      <el-table-column label="商品货号" align="center" prop="goodsInfoVo.commodityGoodsCode" />
      <el-table-column label="商品名称" align="center" prop="goodsInfoVo.commodityName" />
      <el-table-column label="经销商" align="center" prop="goodsInfoVo.dealer.dealerName" />
      <el-table-column label="商品原价（元）" align="center" prop="goodsInfoVo.commodityPrice" />
      <el-table-column label="商品库存" align="center" prop="goodsInfoVo.commodityStock" />
      <el-table-column label="活动价格（元）" align="center" prop="activityPrice" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['marketing:activitygoods:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['marketing:activitygoods:remove']"
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

    <!-- 添加或修改活动商品对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="商品活动价格" prop="activityPrice">
          <el-input-number v-model="form.activityPrice" :precision="2" :step="1" :max="99999999" :controls="false" /><span>元</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <activity-goods-detail ref="detail" @ok="detailOk" />
  </div>
</template>

<script>
import { listActivitygoods, getActivitygoods, delActivitygoods, addActivitygoods, updateActivitygoods } from "@/api/marketing/activitygoods";
import activityGoodsDetail from "../../commodityinfo/activityGoodsDetail";
import {CodeToText, provinceAndCityData} from "element-china-area-data";

export default {
  name: "Activitygoods",
  components: {activityGoodsDetail},
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
      // 活动商品表格数据
      activitygoodsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityType: 5
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        activityPrice: [
          {required: true, message: "活动价格不能为空", trigger: "blur"}
        ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询活动商品列表 */
    getList() {
      this.loading = true;
      //获取当前选择的市，进行模糊查询
      if (this.tempCity != null) {
        this.queryParams.searchValue = CodeToText[this.tempCity[this.tempCity.length-1]]
      } else {
        this.queryParams.searchValue = null;
      }

      listActivitygoods(this.queryParams).then(response => {
        this.activitygoodsList = response.rows;
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
        activityId: null,
        activityCommodityId: null,
        activityPrice: null,
        activityType: null
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
      this.ids = selection.map(item => item.activityId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      //ref 写在标签上时：this.$refs.名字  获取的是标签对应的dom元素 ref 写在组件上时：这时候获取到的是 子组件（比如counter）的引用
      this.$refs.detail.show('添加活动商品',this.form.activityId);
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const activityId = row.activityId || this.ids
      getActivitygoods(activityId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改活动商品";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.activityPrice === 0){
            this.msgError('请输入大于 0 的活动价格');
            return;
          }
          if (this.form.activityId != null) {
            updateActivitygoods(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addActivitygoods(this.form).then(response => {
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
      const activityIds = row.activityId || this.ids;
      this.$confirm('是否确认删除活动商品编号为"' + activityIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delActivitygoods(activityIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('marketing/activitygoods/export', {
        ...this.queryParams
      }, `marketing_activitygoods.xlsx`)
    },
    //活动地区截取 经销商地区截出市名称
    handleActivityArea(row, column, cellValue, index) {
      const data = row.goodsInfoVo.dealer.dealerArea;
      return data.substring(data.indexOf('省')+1,data.indexOf('市')+1 )
    },

    //弹出页回调
    detailOk(data) {
      data.activityType = '1';
      const dealerArea = data.dealerArea.substring(data.dealerArea.indexOf('省')+1,data.dealerArea.indexOf('市')+1);
      listActivitygoods({searchValue: dealerArea}).then(result =>{
        if (result.code === 200) {
          if (result.total > 0) {
            this.msgError("该地区下已经存在优惠商品，请删除原优惠商品，再添加");
          } else {
            this.$refs.detail.open = false;
            this.$refs.detail.reset();
            if (data.activityId != null) {
              updateActivitygoods(data).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                }
              });
            } else {
              addActivitygoods(data).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                }
              });
            }
          }
        }
      })
    }
  }
};
</script>
