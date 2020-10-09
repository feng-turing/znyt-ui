<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="推送类型" prop="pushType">
        <el-select v-model="queryParams.pushType" placeholder="请选择推送类型" clearable size="small" >
          <el-option
            v-for="dict in pushTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="推送主题" prop="pushTheme">
        <el-input
          v-model="queryParams.pushTheme"
          placeholder="请输入推送主题"
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
          v-hasPermi="['system:pushmsg:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:pushmsg:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:pushmsg:remove']"
        >删除</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:pushmsg:export']"
        >导出</el-button>
      </el-col>-->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="pushmsgList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="推送类型" align="center" prop="pushType" :formatter="pushTypeFormat" />
      <el-table-column label="推送主题" align="center" prop="pushTheme" />
      <el-table-column label="发布时间" align="center" prop="pushReleaseTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.pushReleaseTime, '{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="跳转链接" align="center" prop="pushUrl" />
      <el-table-column label="推送详情" align="center" prop="pushDetail" />
<!--      <el-table-column label="推送图片" align="center" prop="pushImg" />-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:pushmsg:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:pushmsg:remove']"
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

    <!-- 添加或修改推送消息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="推送类型" prop="pushType">
              <el-select v-model="form.pushType" placeholder="请选择推送类型" @change="pushTypeChange">
                <el-option
                  v-for="dict in pushTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="推送主题" prop="pushTheme">
              <el-input v-model="form.pushTheme" placeholder="请输入推送主题" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="pushTypeOpen">
          <el-col :span="12">
            <el-form-item label="发布时间" prop="pushReleaseTime">
              <el-date-picker clearable size="small" style="width: 200px"
                              v-model="form.pushReleaseTime"
                              type="datetime"
                              value-format="yyyy-MM-dd HH:mm:ss"
                              format="yyyy-MM-dd HH:mm"
                              placeholder="选择发布时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="跳转链接" prop="pushUrl">
              <el-input v-model="form.pushUrl" placeholder="请输入跳转链接" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="pushTypeOpen">
          <el-col :span="24">
           <!-- <el-form-item label="推送图片" prop="pushImg">
              <el-input v-model="form.pushImg" placeholder="请输入推送图片"/>
            </el-form-item>-->
            <el-form-item label="推送图片" prop="pushImg">
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
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="推送详情" prop="pushDetail">
              <el-input type="textarea" v-model="form.pushDetail" placeholder="请输入推送详情" rows="3"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listPushmsg, getPushmsg, delPushmsg, addPushmsg, updatePushmsg } from "@/api/system/pushmsg";
import {getToken} from "@/utils/auth";
import {delImg} from "@/api/system/commodityInfo";
import {isUrl} from "@/utils/validate";

export default {
  name: "Pushmsg",
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
      pushTypeOpen: false,
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
      // 推送消息表格数据
      pushmsgList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 推送类型字典
      pushTypeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        pushType: null,
        pushTheme: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        pushType: [
          {required: true, message: '推送类型不能为空', trigger: "blur"},
        ],
        pushTheme: [
          {required: true, message: '推送主题不能为空', trigger: "blur"},
        ],
        pushDetail: [
          {required: true, message: '推送详情不能为空', trigger: "blur"},
        ],
        pushUrl: [
          {required: false, message: '跳转链接不能为空', trigger: "blur"},
          {validator: isUrl, trigger: 'blur'}
        ],
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("push_msg_type").then(response => {
      this.pushTypeOptions = response.data;
    });
  },
  methods: {
    /** 查询推送消息列表 */
    getList() {
      this.loading = true;
      listPushmsg(this.queryParams).then(response => {
        this.pushmsgList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 推送类型字典翻译
    pushTypeFormat(row, column) {
      return this.selectDictLabel(this.pushTypeOptions, row.pushType);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        pushId: null,
        pushType: null,
        pushTheme: null,
        pushReleaseTime: null,
        pushUrl: null,
        pushDetail: null,
        pushImg: null,
        createTime: null,
        createBy: null,
        updateTime: null,
        updateBy: null,
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
      this.ids = selection.map(item => item.pushId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.fileList = [];
      this.title = "添加推送消息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const pushId = row.pushId || this.ids
      getPushmsg(pushId).then(response => {
        this.form = response.data;
        this.fileList = this.form.pushImg == null || this.form.pushImg == "" ? [] : JSON.parse(this.form.pushImg);
        this.open = true;
        this.title = "修改推送消息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.pushType === '0') {
              if (this.form.pushReleaseTime == null || this.form.pushReleaseTime == '') {
                this.msgError('发布时间不允许为空');
                return;
              }
          }
          //将 新增图片数组与删除图片数组添加到form中进行提交
          this.form.newImgs = this.newImgs;
          this.form.delImgs = this.delImgs;
          if (this.form.pushId != null) {
            updatePushmsg(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addPushmsg(this.form).then(response => {
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
      const pushIds = row.pushId || this.ids;
      this.$confirm('是否确认删除推送消息编号为"' + pushIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delPushmsg(pushIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/pushmsg/export', {
        ...this.queryParams
      }, `system_pushmsg.xlsx`)
    },

    //推送类型发生改变时
    pushTypeChange(value){
      if (value === '0') {
        this.pushTypeOpen = true;
      } else {
        this.pushTypeOpen = false;
        this.form.pushReleaseTime = '';
        this.form.pushUrl = '';
        this.form.pushImg = '';
        this.fileList = [];
        this.newImgs = [];
        this.delImgs = [];
      }
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
