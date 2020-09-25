<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="公开课名称" prop="publicClassName">
        <el-input
          v-model="queryParams.publicClassName"
          placeholder="请输入公开课名称"
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
          v-hasPermi="['system:publicClass:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:publicClass:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:publicClass:remove']"
        >删除</el-button>
      </el-col>
     <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:publicClass:export']"
        >导出</el-button>
      </el-col>-->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="publicClassList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="公开课主键" align="center" prop="publicClassId" />-->
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="公开课名称" align="center" prop="publicClassName" />
      <el-table-column label="主讲人" align="center" prop="publicClassHost" />
      <el-table-column label="公开课链接" align="center" prop="publicClassUrl" />
      <el-table-column label="公开课播放次数" align="center" prop="publicClassPlayNum" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:publicClass:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:publicClass:remove']"
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

    <!-- 添加或修改公开课信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="公开课名称" prop="publicClassName">
          <el-input v-model="form.publicClassName" placeholder="请输入公开课名称" />
        </el-form-item>
        <el-form-item label="主讲人" prop="publicClassHost">
          <el-input v-model="form.publicClassHost" placeholder="请输入公开课主持人" />
        </el-form-item>
        <el-form-item label="公开课链接" prop="publicClassUrl">
          <el-input v-model="form.publicClassUrl" placeholder="请输入公开课链接" />
        </el-form-item>
  <!--      <el-form-item label="播放次数" prop="publicClassPlayNum">
          <el-input v-model="form.publicClassPlayNum" placeholder="请输入公开课播放次数" />
        </el-form-item>-->
        <el-form-item label="公开课简介">
          <el-input v-model="form.remark" placeholder="请输入公开课简介" type="textarea" rows="3" />
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
import { listPublicClass, getPublicClass, delPublicClass, addPublicClass, updatePublicClass } from "@/api/system/publicClass";
import { isUrl } from '@/utils/validate'

export default {
  name: "PublicClass",
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
      // 公开课信息表格数据
      publicClassList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        publicClassName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      publicClassName: [
          { required: true, message: "公开课名称不能为空", trigger: "blur" }
        ],
        publicClassHost: [
        { required: true, message: "公开课主讲人", trigger: "blur" }
      ],
      publicClassUrl: [
        { required: true, message: "公开课地址", trigger: "blur" },
        {validator: isUrl, trigger: 'blur'}
      ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询公开课信息列表 */
    getList() {
      this.loading = true;
      listPublicClass(this.queryParams).then(response => {
        this.publicClassList = response.rows;
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
        publicClassId: null,
        publicClassName: null,
        publicClassHost: null,
        publicClassUrl: null,
        publicClassPlayNum: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null
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
      this.ids = selection.map(item => item.publicClassId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加公开课信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const publicClassId = row.publicClassId || this.ids
      getPublicClass(publicClassId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改公开课信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.publicClassId != null) {
            updatePublicClass(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addPublicClass(this.form).then(response => {
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
      const publicClassIds = row.publicClassId || this.ids;
      this.$confirm('是否确认删除公开课信息编号为"' + publicClassIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delPublicClass(publicClassIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/publicClass/export', {
        ...this.queryParams
      }, `system_publicClass.xlsx`)
    },

  }
};
</script>
