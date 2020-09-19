<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="经销商名称" prop="dealerName">
        <el-input
          v-model="queryParams.dealerName"
          placeholder="请输入经销商名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="commodityName">
        <el-input
          v-model="queryParams.commodityName"
          placeholder="请输入商品名称"
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
          v-hasPermi="['system:commodityInfo:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:commodityInfo:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:commodityInfo:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:commodityInfo:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commodityInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <!--      <el-table-column label="经销商id" align="center" prop="dealerId" />-->
      <el-table-column label="经销商名称" align="center" prop="dealerName"/>
      <el-table-column label="商品名称" align="center" prop="commodityName"/>
      <el-table-column label="商品货号" align="center" prop="commodityGoodsCode"/>
      <el-table-column label="商品分类" align="center" prop="commodityType"/>
      <el-table-column label="商品价格" align="center" prop="commodityPrice"/>
      <el-table-column label="商品库存" align="center" prop="commodityStock"/>
      <el-table-column label="会员价" align="center" prop="commodityMemberPrice"/>
      <el-table-column label="是否上架" align="center" prop="commodityIsRelease" :formatter="commodityIsReleaseFormat"/>
      <!--      <el-table-column label="商品规格" align="center" prop="commodityCapacity" />-->
      <!--      <el-table-column label="关键词" align="center" prop="commodityKeyword" />-->
      <!--      <el-table-column label="商品图片" align="center" prop="commodityImg" />-->
      <!--      <el-table-column label="是否会员" align="center" prop="commodityIsMember" :formatter="commodityIsMemberFormat" />-->
      <!--      <el-table-column label="详情图片" align="center" prop="commodityDetailImg" />-->
      <!--      <el-table-column label="商品详述" align="center" prop="commodityDetail" />-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleCommodityDetail(scope.row)"
          >添加商品详情
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:commodityInfo:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:commodityInfo:remove']"
          >删除
          </el-button>
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

    <!-- 添加或修改自营商品信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body :before-close="dialogBeforeClose">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
<!--            <el-form-item label="经销商id" prop="dealerId">-->
            <el-form-item label="经销商" prop="dealerId">
<!--              <el-input v-model="form.dealerId" placeholder="请输入经销商id"/>-->
              <treeselect v-model="form.dealerId" :options="dealerOptions" :disable-branch-nodes="true" :show-count="true" placeholder="请选择经销商" />
            </el-form-item>
          </el-col>
          <!--<el-col :span="12">
            <el-form-item label="经销商名称" prop="dealerName">
              <el-input v-model="form.dealerName" placeholder="请输入经销商名称"/>
            </el-form-item>
          </el-col>-->
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="commodityName">
              <el-input v-model="form.commodityName" placeholder="请输入商品名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品货号" prop="commodityGoodsCode">
              <el-input v-model="form.commodityGoodsCode" placeholder="请输入商品货号"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品库存" prop="commodityStock">
              <el-input-number v-model="form.commodityStock"  :min="1" :max="99999999" placeholder="请输入商品库存"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品规格" prop="commodityCapacity">
              <el-input v-model="form.commodityCapacity" placeholder="请输入商品规格"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品价格" prop="commodityPrice">
              <el-input-number v-model="form.commodityPrice"  :precision="2" :step="1" :max="99999999" placeholder="请输入商品价格"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否上架" prop="commodityIsRelease">
              <el-select v-model="form.commodityIsRelease" placeholder="请选择是否上架">
                <el-option
                  v-for="dict in commodityIsReleaseOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品分类" prop="commodityType">
              <el-select v-model="form.commodityType" placeholder="请选择商品分类">
                <el-option
                  v-for="sort in commodityTypeOptions"
                  :key="sort.twoId"
                  :label="sort.twoName"
                  :value="sort.twoName"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关键词" prop="commodityKeyword">
              <el-input v-model="form.commodityKeyword" placeholder="请输入关键词"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <!--<el-form-item label="商品图片" prop="commodityImg">
              <el-input v-model="form.commodityImg" placeholder="请输入商品图片"/>
            </el-form-item>-->
            <el-form-item label="商品图片" prop="commodityImg">
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
                <el-button slot="trigger" size="small" type="primary">选取商品封面</el-button>
                <!--          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>-->
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件</div>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item label="是否会员" prop="commodityIsMember">
                <el-radio-group v-model="form.commodityIsMember" @change="fun_ismember_change" >
                  <el-radio
                    v-for="dict in commodityIsMemberOptions"
                    :key="dict.dictValue"
                    :label="dict.dictValue"
                  >{{ dict.dictLabel }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            <el-form-item label="会员价" >
              <el-input-number v-model="form.commodityMemberPrice" :precision="2" :step="1" :max="99999999" :disabled="isMember" placeholder="请输入会员价"/>
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="title" :visible.sync="openDetail" width="800px" append-to-body :before-close="dialogBeforeClose">
      <el-form ref="formDetail" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="商品详述" prop="commodityDetail" >
              <el-input v-model="form.commodityDetail" type="textarea" placeholder="请输入内容" rows="4"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="详情图片" prop="commodityDetailImg">
<!--              <el-input v-model="form.commodityDetailImg" placeholder="请输入详情图片"/>-->
              <el-upload
                :headers="header"
                :action="url"
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
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm1">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCommodityInfo, getCommodityInfo, delCommodityInfo, addCommodityInfo, updateCommodityInfo,update2CommodityInfo,  getSortTwoAll, delImg } from "@/api/system/commodityInfo";
import { treeselect } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {getToken} from "@/utils/auth";

export default {
  name: "CommodityInfo",
  components: { Treeselect },
  data() {
    return {
      header: {"Authorization": 'Bearer ' + getToken()},
      //上传图片
      fileList: [],
      //表单提交url
      url: process.env.VUE_APP_BASE_API + '/system/file/uploadImg/commodity',
      //商品详情图片
      detailImgList: [],
      dialogVisible: false,
      dialogImageUrl: '',
      detailImgNewList:[],
      detailImgDelList:[],
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
      // 自营商品信息表格数据
      commodityInfoList: [],
      // 弹出层标题
      title: "",
      //经销商选择
      dealerOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 是否弹出商品详情
      openDetail: false,
      // 是否上架字典
      commodityIsReleaseOptions: [],
      // 是否会员字典
      commodityIsMemberOptions: [],
      // 商品分类字典
      commodityTypeOptions: [],
      // 是否会员 默认空
      isMember: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dealerName: null,
        commodityName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dealerId: [
          {required: true, message: "经销商不能为空", trigger: "blur"}
        ],
        dealerName: [
          {required: true, message: "经销商名称不能为空", trigger: "blur"}
        ],
        commodityName: [
          {required: true, message: "商品名称不能为空", trigger: "blur"}
        ],
        commodityGoodsCode: [
          {required: true, message: "商品货号不能为空", trigger: "blur"}
        ],
        commodityStock: [
          {required: true, message: "商品库存不能为空", trigger: "blur"}
        ],
        commodityCapacity: [
          {required: true, message: "商品规格不能为空", trigger: "blur"}
        ],
        commodityPrice: [
          {required: true, message: "商品价格不能为空", trigger: "blur"}
        ],
        commodityIsRelease: [
          {required: true, message: "是否上架不能为空", trigger: "change"}
        ],
        commodityType: [
          {required: true, message: "商品分类不能为空", trigger: "change"}
        ],
        commodityKeyword: [
          {required: true, message: "关键词不能为空", trigger: "blur"}
        ],
        commodityImg: [
          {required: true, message: "商品图片不能为空", trigger: "blur"}
        ],
        commodityIsMember: [
          {required: true, message: "是否会员不能为空", trigger: "blur"}
        ],
        /*commodityMemberPrice: [
          {required: true, message: "会员价不能为空", trigger: "blur"}
        ],*/
        commodityDetailImg: [
          {required: true, message: "详情图片不能为空", trigger: "blur"}
        ],
        commodityDetail: [
          {required: true, message: "商品详述不能为空", trigger: "blur"}
        ],
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_yes_no").then(response => {
      this.commodityIsReleaseOptions = response.data;
    });
    this.getDicts("sys_yes_no").then(response => {
      this.commodityIsMemberOptions = response.data;
    });
    getSortTwoAll().then(response => {
      this.commodityTypeOptions = response.data;
    });
  },
  methods: {
    /** 查询自营商品信息列表 */
    getList() {
      this.loading = true;
      this.getTreeselect();
      listCommodityInfo(this.queryParams).then(response => {
        this.commodityInfoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      treeselect().then(response => {
        this.dealerOptions = response.data;
      });
    },

    // 是否上架字典翻译
    commodityIsReleaseFormat(row, column) {
      return this.selectDictLabel(this.commodityIsReleaseOptions, row.commodityIsRelease);
    },
    // 是否会员字典翻译
    commodityIsMemberFormat(row, column) {
      return this.selectDictLabel(this.commodityIsMemberOptions, row.commodityIsMember);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.openDetail = false;
      this.reset();
      this.fileList = [];
      this.detailImgList = [];
    },
    // 表单重置
    reset() {
      this.form = {
        commodityId: null,
        dealerId: null,
        dealerName: null,
        commodityName: null,
        commodityGoodsCode: null,
        commodityStock: null,
        commodityCapacity: null,
        commodityPrice: null,
        commodityIsRelease: null,
        commodityType: null,
        commodityKeyword: null,
        commodityImg: null,
        commodityIsMember: "0",
        commodityMemberPrice: null,
        commodityDetailImg: null,
        commodityDetail: null,
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
      this.ids = selection.map(item => item.commodityId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.fileList = [];
      this.open = true;
      this.title = "添加自营商品信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const commodityId = row.commodityId || this.ids
      getCommodityInfo(commodityId).then(response => {
        this.form = response.data;
        this.fileList=[{
          name: this.form.commodityName,
          url: this.form.commodityImg
        }];
        this.open = true;
        this.title = "修改自营商品信息";
      });
    },

    /** 行添加商品详情操作*/
    handleCommodityDetail(row) {
      this.reset();
      const commodityId = row.commodityId || this.ids

      getCommodityInfo(commodityId).then(response => {
        this.form = response.data;
        this.detailImgList = this.form.commodityDetailImg == null || this.form.commodityDetailImg == "" ? [] : this.form.commodityDetailImg;
        this.openDetail = true;
        this.titleDetail = "添加商品详情";
      });
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.commodityId != null) {
            updateCommodityInfo(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCommodityInfo(this.form).then(response => {
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

    /** 详情提交按钮 */
    submitForm1() {

      this.$refs["formDetail"].validate(valid => {
        if (valid) {
          /*//临时存储图片集合用
          var imgs = [];
          //提交前拿到上传的图片集合
          console.log(this.detailImgList);
          for (let i = 0; i < this.detailImgList.length; i++) {
            const response = this.detailImgList[i];
            const _file_path= response.response.data;
            imgs.push(_file_path);
          }
          //将数组转换成字符串 默认用逗号隔开
          this.form.commodityDetailImg = imgs.join(',');*/
          this.form.newImgs = this.detailImgNewList;
          this.form.delImgs = this.detailImgDelList;
          if (this.form.commodityId != null) {
            update2CommodityInfo(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("添加商品详情成功");
                this.openDetail = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const commodityIds = row.commodityId || this.ids;
      this.$confirm('是否确认删除自营商品信息编号为"' + commodityIds + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delCommodityInfo(commodityIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(function () {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/commodityInfo/export', {
        ...this.queryParams
      }, `system_commodityInfo.xlsx`)
    },

    /**
     * 单选框改变触发
     * @param value
     */
    fun_ismember_change(value) {
      if (value == 'Y') {
        this.isMember = false;
      } else {
        this.isMember = true;
        this.form.commodityMemberPrice = 0;
      }
    },

    //upload file 函数
    handleSeccess(response, file, fileList1) {
      if (response.code === 200 ) {
        //如果商品信息dialog打开,就是商品标题图
        if (this.open) {
          this.form.commodityImg = response.data;
          this.fileList = fileList1;
        }
        //如果时商品详情dialog打开,就是详情图
        else if (this.openDetail) {
          this.detailImgList = fileList1;
          //每次新增都添加都新增集合中
          this.detailImgNewList.push(response);
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
      this.form.commodityImg = null;
      this.fileList = fileList1;
      //每次删除都添加到删除数组中
      this.detailImgDelList.push(file1.name);
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

    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //上传文件提交时
    beforeUpload(file) {
      return true;
    },
    //dialog框 关闭时触发
    dialogBeforeClose(done) {
      this.reset();
      this.fileList = [];
      this.detailImgList = []
      done();
    },

  }
};
</script>
