<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <!--<el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>-->
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-copy-document"
          size="mini"
          :disabled="multiple"
          @click="handleCopyAdd"
        >复制</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:advert:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:advert:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:advert:export']"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>-->
    </el-row>

    <el-table v-loading="loading" :data="advertList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="主键" align="center" prop="advertId" />-->
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <el-table-column label="广告位置" align="center" prop="advertLocation" />
      <el-table-column label="广告名称" align="center" prop="advertLinkName" />
<!--      <el-table-column label="链接地址" align="center" prop="advertLinkUrl" />-->
      <el-table-column label="地区" align="center" prop="advertAreaName" />
      <el-table-column label="时间" align="center" prop="advertPutTime" :formatter="advertPutTimeFormat"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:advert:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:advert:remove']"
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

    <!-- 添加或修改广告信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="广告位置" prop="advertLocation">
          <el-input v-model="form.advertLocation" placeholder="请输入广告位置" disabled/>
        </el-form-item>

        <el-form-item label="广告名称" prop="advertLinkName">
          <el-input v-model="form.advertLinkName" placeholder="请输入链接名称" />
        </el-form-item>
        <el-form-item label="投放时间" prop="advertPutTime">
<!--          <el-input v-model="form.advertLinkUrl" placeholder="广告投放时间" />-->
          <el-date-picker
            v-model="form.advertPutTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="链接地址" prop="advertLinkUrl">
          <el-input v-model="form.advertLinkUrl" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="地区" prop="advertArea">
<!--          <el-input v-model="form.advertArea" placeholder="请输入广告区域" />-->
          <el-cascader
            :options="options"
            :props="props"
            v-model="form.advertArea"
            :collapse-tags="false"
            show-all-levels
            filterable
            clearable></el-cascader>
        </el-form-item>
        <el-form-item label="广告图片" prop="advertImg">
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
            multiple
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
import { listAdvert, getAdvert, delAdvert, addAdvert, updateAdvert, copyAddAdvert } from "@/api/system/advert";
import { provinceAndCityData, regionData, provinceAndCityDataPlus, regionDataPlus, CodeToText, TextToCode } from 'element-china-area-data'
import {getToken} from "@/utils/auth";
import {delImg} from "@/api/system/commodityInfo";

export default {
  name: "Advert",
  data() {
    return {
      header: {"Authorization": 'Bearer ' + getToken()},
      //上传图片
      fileList: [],
      //表单提交url
      url: process.env.VUE_APP_BASE_API + '/system/file/uploadImg/advert',
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
      // 广告信息表格数据
      advertList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      //地区省市联动
      props: { multiple: true },
      options: provinceAndCityData,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        advertLocation: [
          {required: true, message: "广告位置不能为空", trigger: "blur"}
        ],
        advertLinkName: [
          {required: true, message: "广告名称不能为空", trigger: "blur"}
        ],
        // advertPutTime: [
        //   {required: true, message: "投放时间不能为空", trigger: "blur"}
        // ],
        advertPutTime: [
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
        advertLinkUrl: [
          {required: true, message: "链接地址不能为空", trigger: "blur"}
        ],
        advertArea: [
          {type: 'array',required: true, message: "地区不能为空", trigger: "blur"}
        ],
        advertImg: [
          {required: true, message: "图片不能为空", trigger: "blur"}
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询广告信息列表 */
    getList() {
      this.loading = true;
      listAdvert(this.queryParams).then(response => {
        this.advertList = response.rows;
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
        advertId: null,
        advertLocation: null,
        advertArea: null,
        advertAreaName: null,
        advertLinkName: null,
        advertLinkUrl: null,
        advertImg: null,
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
      this.ids = selection.map(item => item.advertId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加广告信息";
    },

    /** 复制增加 */
    handleCopyAdd() {
      copyAddAdvert(this.ids).then(response => {
        if (response.code === 200) {
          this.msgSuccess("复制成功");
          this.getList();
        } else {
          this.msgError("复制失败,稍后重试");
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const advertId = row.advertId || this.ids
      getAdvert(advertId).then(response => {
        this.form = response.data;
        this.form.advertPutTime = this.form.advertPutTime == null || this.form.advertPutTime == '' ? [] : this.form.advertPutTime.split(',');
        this.form.advertArea = this.form.advertArea == null || this.form.advertArea == '' ? [] : JSON.parse(this.form.advertArea);
        this.fileList = this.form.advertImg == null || this.form.advertImg == "" ? [] : JSON.parse(this.form.advertImg);
        this.open = true;
        this.title = "修改广告信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          const submitArea = [];
          const areas = this.form.advertArea;
          for (let i = 0; i < areas.length; i++) {
            const area = areas[i];
            submitArea.push(CodeToText[area[1]]);
          }
          this.form.advertPutTime = this.form.advertPutTime.join(',');
          //将 新增图片数组与删除图片数组添加到form中进行提交
          this.form.newImgs = this.newImgs;
          this.form.delImgs = this.delImgs;
          this.form.advertAreaName = submitArea.join(',');
          if (this.form.advertId != null) {
            updateAdvert(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addAdvert(this.form).then(response => {
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
      const advertIds = row.advertId || this.ids;
      this.$confirm('是否确认删除广告信息编号为"' + advertIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delAdvert(advertIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/advert/export', {
        ...this.queryParams
      }, `system_advert.xlsx`)
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
    //上传文件变化时
    beforeRemove(file1, fileList1) {
      if ( file1.response == undefined || file1.response == null || file1.response == '' ) {
        return;
      }
      const data = {
        delImgPath: file1.response.data
      }
      //删除临时图片
      delImg(data).then(response => {
        console.log(response);
      });
    },
    advertPutTimeFormat(row, column, cellValue, index) {
      if (cellValue !== null && cellValue !== undefined) {

        return cellValue.replaceAll(',','至');
      }
    }
  }
};
</script>
