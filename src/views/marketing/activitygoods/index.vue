<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动类型(1:一元抢购,5:五折特惠)" prop="activityType">
        <el-select v-model="queryParams.activityType" placeholder="请选择活动类型(1:一元抢购,5:五折特惠)" clearable size="small">
          <el-option label="请选择字典生成" value="" />
        </el-select>
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
      <el-table-column label="活动主键" align="center" prop="activityId" />
      <el-table-column label="活动商品主键" align="center" prop="activityCommodityId" />
      <el-table-column label="活动价格" align="center" prop="activityPrice" />
      <el-table-column label="活动类型(1:一元抢购,5:五折特惠)" align="center" prop="activityType" />
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
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动商品主键" prop="activityCommodityId">
          <el-input v-model="form.activityCommodityId" placeholder="请输入活动商品主键" />
        </el-form-item>
        <el-form-item label="活动价格" prop="activityPrice">
          <el-input v-model="form.activityPrice" placeholder="请输入活动价格" />
        </el-form-item>
        <el-form-item label="活动类型(1:一元抢购,5:五折特惠)" prop="activityType">
          <el-select v-model="form.activityType" placeholder="请选择活动类型(1:一元抢购,5:五折特惠)">
            <el-option label="请选择字典生成" value="" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <partner-goods-detail ref="detail" />
  </div>
</template>

<script>
import { listActivitygoods, getActivitygoods, delActivitygoods, addActivitygoods, updateActivitygoods } from "@/api/marketing/activitygoods";
import partnerGoodsDetail from "../../commodityinfo/partnerGoodsDetail";

export default {
  name: "Activitygoods",
  components: {partnerGoodsDetail},
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
        activityType: null
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
    /** 查询活动商品列表 */
    getList() {
      this.loading = true;
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
      this.$refs.detail.show('添加活动商品');
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
    }
  }
};
</script>
