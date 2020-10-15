<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动地区名称" prop="activityAreaName">
        <el-input
          v-model="queryParams.activityAreaName"
          placeholder="请输入活动地区名称"
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
          v-hasPermi="['marketing:activityInfo:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['marketing:activityInfo:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['marketing:activityInfo:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['marketing:activityInfo:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="activityInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="活动地区" align="center" prop="activityArea" />
      <el-table-column label="活动地区名称" align="center" prop="activityAreaName" />
      <el-table-column label="广告图" align="center" prop="activityAdvertImg" />
      <el-table-column label="上下架时间" align="center" prop="beginEndTime" />
      <el-table-column label="活动规则描述" align="center" prop="activityRuleDescribe" />
      <el-table-column label="活动状态" align="center" prop="activityStatus" :formatter="activityStatusFormat" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['marketing:activityInfo:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['marketing:activityInfo:remove']"
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

    <!-- 添加或修改活动信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动地区" prop="activityArea">
          <el-input v-model="form.activityArea" placeholder="请输入活动地区" />
        </el-form-item>
        <el-form-item label="活动地区名称" prop="activityAreaName">
          <el-input v-model="form.activityAreaName" placeholder="请输入活动地区名称" />
        </el-form-item>
        <el-form-item label="广告图" prop="activityAdvertImg">
          <el-input v-model="form.activityAdvertImg" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="上下架时间" prop="beginEndTime">
          <el-input v-model="form.beginEndTime" placeholder="请输入上下架时间" />
        </el-form-item>
        <el-form-item label="活动规则描述" prop="activityRuleDescribe">
          <el-input v-model="form.activityRuleDescribe" placeholder="请输入活动规则描述" />
        </el-form-item>
        <el-form-item label="活动状态">
          <el-radio-group v-model="form.activityStatus">
            <el-radio
              v-for="dict in activityStatusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="活动类型" prop="activityType">
          <el-input v-model="form.activityType" placeholder="请输入活动类型" />
        </el-form-item>
        <el-form-item label="备注" prop="remart">
          <el-input v-model="form.remart" placeholder="请输入备注" />
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
import { listActivityInfo, getActivityInfo, delActivityInfo, addActivityInfo, updateActivityInfo } from "@/api/marketing/activityInfo";

export default {
  name: "ActivityInfo",
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
      // 活动信息表格数据
      activityInfoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 活动状态字典
      activityStatusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityAreaName: null,
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
    this.getDicts("sys_normal_disable").then(response => {
      this.activityStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询活动信息列表 */
    getList() {
      this.loading = true;
      listActivityInfo(this.queryParams).then(response => {
        this.activityInfoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 活动状态字典翻译
    activityStatusFormat(row, column) {
      return this.selectDictLabel(this.activityStatusOptions, row.activityStatus);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        activityArea: null,
        activityAreaName: null,
        activityAdvertImg: null,
        beginEndTime: null,
        activityRuleDescribe: null,
        activityStatus: "0",
        activityType: null,
        createBy: null,
        updateBy: null,
        createTime: null,
        updateTime: null,
        remart: null
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加活动信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getActivityInfo(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改活动信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateActivityInfo(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addActivityInfo(this.form).then(response => {
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
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除活动信息编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delActivityInfo(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('marketing/activityInfo/export', {
        ...this.queryParams
      }, `marketing_activityInfo.xlsx`)
    }
  }
};
</script>