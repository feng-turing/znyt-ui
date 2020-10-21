<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="预售标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入预售标题"
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
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="saleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="预售标题" align="center" prop="title" />
      <el-table-column label="地区" align="center" prop="areaName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
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

    <!-- 添加或修改营销预售对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1000px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="预售标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入预售标题" maxlength="100"/>
        </el-form-item>
        <el-form-item label="地区" prop="areaCode">
          <el-cascader
            :options="areaOptions"
            :props="props"
            v-model="form.areaCode"
            :collapse-tags="false"
            show-all-levels
            filterable
            clearable
            style="width:600px;"></el-cascader>
        </el-form-item>
        <el-form-item label="定金付款时间" prop="depositPayTime">
          <el-date-picker
            v-model="form.depositPayTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="尾款付款时间" prop="restPayTime">
          <el-date-picker
            v-model="form.restPayTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预售内容" prop="content">
          <!--<el-input v-model="form.content" placeholder="预售内容" />-->
          <quill-editor ref="myTextEditor" v-model="form.content" :options="editorOption" style="height:300px;margin-bottom:100px;"></quill-editor>
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
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import { quillEditor } from 'vue-quill-editor'
import { listSale, getSale, delSale, addSale, updateSale } from "@/api/marketing/preSale";
import { provinceAndCityData,CodeToText} from 'element-china-area-data'
export default {
  name: "Sale",
  components: {
    quillEditor
  },
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
      // 营销预售表格数据
      saleList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        title: null,
        areaCode: null,
        areaName: null,
        depositMoney: null,
        depositPayTime: null,
        restMoney: null,
        restPayTime: null,
        content: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        title: [
          {required: true, message: "预售标题不能为空", trigger: "blur"}
        ],
        areaCode: [
          {required: true, message: "地区不能为空", trigger: "blur"}
        ],
        depositPayTime: [
          {required: true, message: "定金付款时间不能为空", trigger: "blur"}
        ],
        restPayTime: [
          {required: true, message: "尾款付款时间不能为空", trigger: "blur"}
        ],
        content: [
          {required: true, message: "预售内容不能为空", trigger: "blur"}
        ],
      },
      props: { multiple: true },
      areaOptions: provinceAndCityData,
      editorOption: {
        placeholder: '编辑内容'
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询营销预售列表 */
    getList() {
      this.loading = true;
      listSale(this.queryParams).then(response => {
        this.saleList = response.rows;
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
        id: null,
        title: null,
        areaCode: null,
        areaName: null,
        depositMoney: null,
        depositPayTime: null,
        restMoney: null,
        restPayTime: null,
        content: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        delFlag: null
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
      this.title = "添加预售";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getSale(id).then(response => {
        this.form = response.data;
        this.form.areaCode = this.form.areaCode == null || this.form.areaCode == '' ? [] : JSON.parse(this.form.areaCode);
        this.form.depositPayTime = this.form.depositPayTime == null || this.form.depositPayTime == '' ? [] : this.form.depositPayTime.split(',');
        this.form.restPayTime = this.form.restPayTime == null || this.form.restPayTime == '' ? [] : this.form.restPayTime.split(',');
        this.open = true;
        this.title = "修改预售";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {

          const submitArea = [];
          const areas = this.form.areaCode;
          for (let i = 0; i < areas.length; i++) {
            const area = areas[i];
            const text = CodeToText[area[1]];
            if(text == '市辖区'){
              submitArea.push(CodeToText[area[0]]);
            }else{
              submitArea.push(text);
            }
          }
          this.form.areaName = submitArea.join(',');
          this.form.depositPayTime = this.form.depositPayTime.toString();
          this.form.restPayTime = this.form.restPayTime.toString();
          this.form.areaCode = JSON.stringify(this.form.areaCode);
          if (this.form.id != null) {
            updateSale(this.form).then(response => {
              if(response.message){
                this.form.areaCode = JSON.parse(this.form.areaCode);
                this.form.depositPayTime = this.form.depositPayTime.split(',');
                this.form.restPayTime = this.form.restPayTime.split(',');
                this.msgError(response.message);
              }else{
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addSale(this.form).then(response => {
              if (response.code === 200) {
                if(response.message){
                  this.form.areaCode = JSON.parse(this.form.areaCode);
                  this.form.depositPayTime = this.form.depositPayTime.split(',');
                  this.form.restPayTime = this.form.restPayTime.split(',');
                  this.msgError(response.message);
                }else{
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                }

              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delSale(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('marketing/preSale/export', {
        ...this.queryParams
      }, `marketing_preSale.xlsx`)
    }
  }
};
</script>
