<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文章标题" prop="newsTitel">
        <el-input
          v-model="queryParams.newsTitel"
          placeholder="请输入文章标题"
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
          v-hasPermi="['system:news:add']"
        >新增</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:news:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:news:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:news:export']"
        >导出</el-button>
      </el-col>-->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="newsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="主键" align="center" prop="newsId" />-->
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <el-table-column label="文章标题" align="center" prop="newsTitel" />
      <el-table-column label="文章链接" align="center" prop="newsLink" />
      <el-table-column label="发布时间" align="center" prop="newsReleaseTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.newsReleaseTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:news:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:news:remove']"
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

    <!-- 添加或修改资讯信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文章标题" prop="newsTitel">
          <el-input v-model="form.newsTitel" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="文章链接" prop="newsLink">
          <el-input v-model="form.newsLink" placeholder="请输入文章链接" />
        </el-form-item>
        <el-form-item label="发布时间" prop="newsReleaseTime">
          <el-date-picker clearable size="small" style="width: 200px"
                          v-model="form.newsReleaseTime"
                          type="datetime"
                          format="yyyy-MM-dd HH:mm"
                          placeholder="选择发布时间">
          </el-date-picker>
        </el-form-item>
        <!--<el-form-item label="文章图片" prop="newsImg">
          <el-input v-model="form.newsImg" placeholder="请输入文章图片" />
        </el-form-item>-->
        <el-form-item label="文章图片" prop="newsImg">
          <el-upload ref="upload"
                     :headers="header"
                     :action="url"
                     :file-list="fileList"
                     list-type="picture-card"
                     :on-preview="handlePictureCardPreview"
                     :on-success="handleSeccess"
                     :on-error="handleError"
                     :on-remove="handleRemove"
                     :before-remove="beforeRemove"
                     :limit="1"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
          <el-dialog :visible.sync="dialogVisible" :modal="false">
            <img width="100%" :src="dialogImageUrl" alt="">
          </el-dialog>
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
import { listNews, getNews, delNews, addNews, updateNews } from "@/api/system/news";
import {getToken} from "@/utils/auth";
import {delImg} from "@/api/system/commodityInfo";

export default {
  name: "News",
  data() {
    return {
      header: {"Authorization": 'Bearer ' + getToken()},
      //上传图片
      fileList: [],
      //表单提交url
      url: process.env.VUE_APP_BASE_API + '/system/file/uploadImg/news',
      //看图使用
      dialogVisible: false,
      dialogImageUrl: '',
      //图片相关数据 new未新增,del为删除
      newImgs: [],
      delImgs: [],
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
      // 资讯信息表格数据
      newsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        newsTitel: null,
      },
      // 表单参数
      form: {
        newsReleaseTime: null,
      },
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询资讯信息列表 */
    getList() {
      this.loading = true;
      listNews(this.queryParams).then(response => {
        this.newsList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
      this.newImgs.length=0;
      this.delImgs.length=0;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        newsId: null,
        newsTitel: null,
        newsLink: null,
        newsImg: null,
        newsReleaseTime: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
      this.ids = selection.map(item => item.newsId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加资讯信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const newsId = row.newsId || this.ids
      getNews(newsId).then(response => {
        this.form = response.data;
        this.fileList = this.form.newsImg == null || this.form.newsImg == "" ? [] : JSON.parse(this.form.newsImg);
        this.open = true;
        this.title = "修改资讯信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          //将 新增图片数组与删除图片数组添加到form中进行提交
          this.form.newImgs = this.newImgs;
          this.form.delImgs = this.delImgs;
          if (this.form.newsId != null) {
            updateNews(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addNews(this.form).then(response => {
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
      const newsIds = row.newsId || this.ids;
      this.$confirm('是否确认删除资讯信息编号为"' + newsIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delNews(newsIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/news/export', {
        ...this.queryParams
      }, `system_news.xlsx`)
    },

    //↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓以下时图片方法
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //upload file 成功函数
    handleSeccess(response, file, fileList1) {
      if (response.code === 200 ) {
        //成功后更新本地图片list
        this.fileList = fileList1;
        //每次新增都添加都新增集合中
        this.newImgs.push(response);
        // 清除上传成功列表
        // this.$refs.upload.clearFiles();
        this.msgSuccess("提交成功");
      } else {
        this.msgError("提交失败,请稍后重试");
      }
    },
    //upload file 失败函数
    handleError() {
      this.msgError("提交失败,请稍后重试");
    },
    //upload file 删除后函数
    handleRemove(file1, fileList1) {
      //成功后更新本地图片list
      this.fileList = fileList1;
      //每次删除都添加到删除数组中
      if ( file1.response == undefined || file1.response == null || file1.response == '' ) {
        this.delImgs.push(file1.name);
      }

    },
    //upload file 删除前函数
    beforeRemove(file1, fileList1) {//上传文件变化时
      if ( file1.response == undefined || file1.response == null || file1.response == '' ) {
        return;
      }
      const data = {
        delImgPath: file1.response.data
      }
      //删除临时图片
      delImg(data).then(response => {
        //console.log(response);
      });
    },
  }
};
</script>
