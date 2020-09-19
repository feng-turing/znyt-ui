<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="二级分类" prop="twoName">
        <el-input
          v-model="queryParams.twoName"
          placeholder="请输入二级分类"
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
          v-hasPermi="['system:sortTwo:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:sortTwo:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:sortTwo:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:sortTwo:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sortTwoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="二级分类" align="center" prop="twoName" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:sortTwo:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:sortTwo:remove']"
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

    <!-- 添加或修改二级分类对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="一级分类主键" prop="oneId" hidden>
          <el-input-number v-model="form.oneId" placeholder="请输入一级分类主键" />
        </el-form-item>
        <el-form-item label="二级分类" prop="twoName">
          <el-input v-model="form.twoName" placeholder="请输入二级分类" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item>
          <el-upload
            class="upload-demo"
            ref="upload"
            :action="url"
            :headers="header"
            accept="image/jpeg,image/jpg,image/png"
            :before-remove="beforeRemove"
            :on-remove="handleRemove"
            :file-list="fileList"
            list-type="picture"
            :limit=1
            :on-success="handleSeccess"
            :on-error="handleError"
            :before-upload="beforeUpload"
          >
            <el-button slot="trigger" size="small" type="primary">选取分类图标</el-button>
            <!--          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>-->
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm" >确 定</el-button>
        <el-button @click="cancel()">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSortTwo, getSortTwo, delSortTwo, addSortTwo, updateSortTwo } from "@/api/system/sortTwo";
import { getToken } from '@/utils/auth'
import {addSortOne, updateSortOne} from "@/api/system/sortOne";
import {delImg} from "@/api/system/commodityInfo";
export default {
  name: "SortTwo",
  data() {
    return {
      header: {"Authorization": 'Bearer ' + getToken()},
      //上传图片
      fileList: [],
      //表单提交url
      url: process.env.VUE_APP_BASE_API + '/system/file/uploadImg/sort',

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
      // 二级分类表格数据
      sortTwoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        twoName: null,
      },
      oneId: 0,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        twoName: [
          { required: true, message: "二级分类不能为空", trigger: "blur" }
        ],
      }

    }
  },
  created() {
    const oneId = this.$route.params && this.$route.params.oneId;
    this.oneId = oneId;
    this.queryParams.oneId = oneId;
    this.getList();
  },
  methods: {
    /** 查询二级分类列表 */
    getList() {
      this.loading = true;
      listSortTwo(this.queryParams).then(response => {
        this.sortTwoList = response.rows;
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
        twoId: null,
        oneId: null,
        twoName: null,
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
      this.ids = selection.map(item => item.twoId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.fileList = [];
      this.showUpload = false;
      this.open = true;
      this.title = "添加分类";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const twoId = row.twoId || this.ids
      getSortTwo(twoId).then(response => {
        this.form = response.data;
        this.fileList=[{
          name: this.form.twoName,
          url: this.form.sortImg
        }];
        this.open = true;
        this.title = "修改二级分类";
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const twoIds = row.twoId || this.ids;
      this.$confirm('是否确认删除二级分类编号为"' + twoIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delSortTwo(twoIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },

    /** 导出按钮操作 */
    handleExport() {
      this.download('system/sortTwo/export', {
        ...this.queryParams
      }, `system_sortTwo.xlsx`)
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        this.form.oneId = this.oneId;
        if (valid) {
          if (this.form.twoId != null) {
            updateSortTwo(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addSortTwo(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              }
            });
          }
        }
        this.fileList = [];
      });
    },
    handleSeccess(response, file, fileList1) {
      console.log(response);
      if (response.code === 200 ) {
        this.form.sortImg = response.data;
        this.fileList = fileList1;
        //this.$refs.upload.clearFiles();
        this.msgSuccess("提交成功");
      } else {
        this.msgError("提交失败,请稍后重试");
      }
    },
    handleError() {
      this.msgError("提交失败,请稍后重试");
    },
    handleRemove(file1, fileList1) {
      this.form.sortImg = null;
      this.fileList = fileList1;
    },
    beforeRemove(file1, fileList1) {//上传文件变化时
      const data = {
        delImgPath: file1.response.data
      }
      //删除临时图片
      delImg(data).then(response => {
        console.log(response);
      });
    },
    //上传文件提交时
    beforeUpload(file) {
      return true;
    },


  }
};
</script>
