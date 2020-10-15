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
      <!--<el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['marketing:activityInfo:export']"
        >导出</el-button>
      </el-col>-->
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
        <el-row>
          <el-col :span="24">
            <el-form-item label="活动地区" prop="activityArea">
              <el-cascader
                :options="options"
                :props="props"
                v-model="form.activityArea"
                :collapse-tags="false"
                show-all-levels
                filterable
                clearable></el-cascader>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="广告图" prop="activityAdvertImg">
              <el-input v-model="form.activityAdvertImg" placeholder="请输入广告图" />
            </el-form-item>
            <el-form-item label="广告图" prop="activityAdvertImg">
              <el-upload
                class="upload-demo"
                ref="upload"
                :action="url"
                :headers="header"
                accept="image/jpeg,image/jpg,image/png"
                :before-upload="beforeUpload"
                :before-remove="beforeRemove"
                :on-remove="handleRemove"
                :on-success="handleSeccess"
                :on-error="handleError"
                :file-list="fileList"
                list-type="picture"
                :limit=1
              >
                <el-button slot="trigger" size="small" type="primary">选取广告图</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件</div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="活动时间" prop="beginEndTime">
              <el-date-picker
                v-model="form.beginEndTime"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm:ss"
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="规则描述" prop="activityRuleDescribe">
              <el-input type="textarea" rows="3" v-model="form.activityRuleDescribe" placeholder="请输入规则描述" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="活动状态">
              <el-radio-group v-model="form.activityStatus">
                <el-radio
                  v-for="dict in activityStatusOptions"
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
  </div>
</template>

<script>
import { listActivityInfo, getActivityInfo, delActivityInfo, addActivityInfo, updateActivityInfo } from "@/api/marketing/activityInfo";
import {provinceAndCityData} from "element-china-area-data";
import {delImg} from "@/api/system/commodityInfo";
import {getToken} from "@/utils/auth";

export default {
  name: "ActivityInfo",
  data() {
    return {
      //地区省市联动
      props: { multiple: false },
      options: provinceAndCityData,
      header: {"Authorization": 'Bearer ' + getToken()},
      //上传图片
      fileList: [],
      //表单提交url
      url: process.env.VUE_APP_BASE_API + '/system/file/uploadImg/activity',

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
        activityArea: [
          {required: true, message: "活动地区不能为空", trigger: "blur"}
        ],
        activityAdvertImg: [
          {required: true, message: "广告图不能为空", trigger: "blur"}
        ],
        beginEndTime: [
          {
            type: 'array',
            required: true,
            message: '请选择日期区间',
            fields: {
              //tpye类型试情况而定,所以如果返回的是date就改成date
              0: { type: 'string', required: true, message: '请选择开始日期' },
              1: { type: 'string', required: true, message: '请选择结束日期' }
            }
          }
        ],
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
        this.form.activityArea = this.form.activityArea.split(',');
        this.form.beginEndTime = this.form.beginEndTime.split(',');
        this.open = true;
        this.title = "修改活动信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log(this.form.activityArea );
          console.log(this.form.beginEndTime );
          if (this.form.activityArea != null && this.form.activityArea != '' && this.form.activityArea != undefined) {
            this.form.activityArea = this.form.activityArea.join(',');
          }
          if (this.form.beginEndTime != null && this.form.beginEndTime != '' && this.form.beginEndTime != undefined) {
            this.form.beginEndTime = this.form.beginEndTime.join(',');
          }
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
    },

    //upload file 函数
    handleSeccess(response, file, fileList1) {
      if (response.code === 200) {
        //如果商品信息dialog打开,就是商品标题图
        if (this.open) {
          this.form.activityAdvertImg = response.data;
          this.fileList = fileList1;
        }
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
      //如果商品信息dialog打开,就是商品标题图
      if (this.open) {
        this.form.activityAdvertImg = null;
        this.fileList = fileList1;
      }
    },

    beforeRemove(file1, fileList1) {//上传文件变化时
      if (file1.response == undefined || file1.response == null || file1.response == '') {
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

    //上传文件提交时
    beforeUpload(file) {
      return true;
    },
    //dialog框 关闭时触发
    dialogBeforeClose(done) {
      this.reset();
      this.fileList = [];
      done();
    },
  }
};
</script>
