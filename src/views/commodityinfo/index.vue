<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="合伙人名称" prop="dealerName">
        <el-input
          v-model="queryParams.dealerName"
          placeholder="请输入合伙人名称"
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
        <el-button
          type="success"
          icon="el-icon-circle-plus"
          size="mini"
          :disabled="multiple"
          @click="handleAddStock"
        >增加库存
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commodityInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <!--      <el-table-column label="合伙人id" align="center" prop="dealerId" />-->
      <el-table-column label="合伙人名称" align="center" prop="dealerName"/>
      <el-table-column label="商品名称" align="center" prop="commodityName"/>
      <el-table-column label="商品货号" align="center" prop="commodityGoodsCode"/>
      <el-table-column label="商品分类" align="center" prop="commodityType"/>
      <el-table-column label="商品价格" align="center" prop="commodityPrice"/>
      <el-table-column label="商品规格" align="center" prop="commodityCapacity"/>
      <el-table-column label="历史库存总量" align="center" prop="commodityStock"/>
      <el-table-column label="未发放商品量" align="center" :formatter="handleNotRelease"/>
      <el-table-column label="经销商库存" align="center">
        <template slot-scope="scope">
          <p style="font-weight: bold">发布库存:{{ scope.row.commodityReleaseSum }}</p>
          <p style="font-weight: bold">剩余库存:
            <router-link :to="{path: '/commdityinfo/dealercommodityInfo', query: {id: scope.row.id}}" class="link-type">
              <span>{{ scope.row.commodityDealerSum }}</span>
            </router-link>
          </p>
        </template>
      </el-table-column>
      <el-table-column label="会员价" align="center" prop="commodityMemberPrice" :formatter="handleMemberPriceFormatter"/>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope" v-if="scope.row.commodityReleaseSum===0">
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
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body >
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="合伙人" prop="dealerId">
              <el-select v-model="form.dealerId" multiple placeholder="请选择合伙人" style="width: 99.99%"
                         :disabled="dealerStatus">
                <el-option
                  v-for="item in this.dealerOptions"
                  :key="item.dealerId"
                  :label="item.dealerName"
                  :value="item.dealerId"
                  filterable
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <!--<el-col :span="12">
            <el-form-item label="合伙人名称" prop="dealerName">
              <el-input v-model="form.dealerName" placeholder="请输入合伙人名称"/>
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
              <el-input v-model="form.commodityGoodsCode" placeholder="请输入商品货号" :disabled="dealerStatus"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品库存" prop="commodityStock">
              <el-input-number v-model="form.commodityStock" :min="1" :max="99999999" placeholder="请输入商品库存" :disabled="dealerStatus"/>
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
              <el-input-number v-model="form.commodityPrice" :precision="2" :step="1" :max="99999999"
                               placeholder="请输入商品价格"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品分类" prop="commodityType">
              <el-select v-model="form.commodityType" placeholder="请选择商品分类">
                <el-option
                  v-for="sort in commodityTypeOptions"
                  :key="sort.twoId"
                  :label="sort.twoName"
                  :value="sort.twoId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!--<el-row>
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
          <el-col :span="12">
            <el-form-item label="关键词" prop="commodityKeyword">
              <el-input v-model="form.commodityKeyword" placeholder="请输入关键词"/>
            </el-form-item>
          </el-col>
        </el-row>-->
        <el-row>
          <el-col :span="12">
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
                <div slot="tip" class="el-upload__tip" style="color: red">只能上传jpg/png文件</div>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否会员" prop="commodityIsMember">
              <el-radio-group v-model="form.commodityIsMember" @change="fun_ismember_change">
                <el-radio
                  v-for="dict in commodityIsMemberOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="会员价">
              <el-input-number v-model="form.commodityMemberPrice" :precision="2" :step="1" :max="99999999"
                               :disabled="isMember" placeholder="请输入会员价"/>
            </el-form-item>
            <el-form-item label="用优惠卷" prop="commodityIsCoupon">
              <el-radio-group v-model="form.commodityIsCoupon">
                <el-radio
                  v-for="dict in commodityIsMemberOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品轮播图" prop="commodityImgs">
              <el-upload
                class="upload-demo"
                ref="uploads"
                :action="url"
                :headers="header"
                accept="image/jpeg,image/jpg,image/png"
                :before-remove="beforeRemove"
                :on-success="handleSeccess2"
                :on-exceed="handleExceed"
                :file-list="fileLists"
                :multiple="true"
                :limit=5
              >
                <el-button slot="trigger" size="small" type="primary">选取商品轮播</el-button>
                <div slot="tip" class="el-upload__tip" style="color: red">只能上传jpg/png文件，且最多上传五张</div>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品详情" prop="commodityDetailImg">
              <el-button size="small" type="primary" @click="handleCommodityDetail()">添加商品详情</el-button>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="商品进货价" prop="commodityPurchasePrice">
              <el-input-number v-model="form.commodityPurchasePrice" :precision="2" :step="1" :max="99999999"
                               :controls="false" placeholder="请输入商品进货价格"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合伙人拿货价" prop="commodityPartnerPrice">
              <el-input-number v-model="form.commodityPartnerPrice" :precision="2" :step="1" :max="99999999"
                               :controls="false" placeholder="请输入合伙人拿货价"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="合伙人单件盈利" prop="commodityIncomePrice">
              <el-input-number v-model="form.commodityIncomePrice" :precision="2" :step="1" :max="99999999"
                               :controls="false" placeholder="请输入合伙人单件盈利"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经销商单件盈利" prop="commodityDealerPrice">
              <el-input-number v-model="form.commodityDealerPrice" :precision="2" :step="1" :max="99999999"
                               :controls="false" placeholder="请输入经销商单件盈利"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>

      <el-dialog :title="title" :visible.sync="openDetail" width="800px" append-to-body >
        <el-form ref="formDetail" :model="form" :rules="rules" label-width="80px">
          <el-row>
            <el-col :span="24">
              <el-form-item label="商品详述" prop="commodityDetail">
                <el-input v-model="form.commodityDetail" type="textarea" placeholder="请输入内容" rows="4"/>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="详情图片">
                <el-upload
                  :headers="header"
                  :action="url"
                  :file-list="detailImgList"
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
<!--          <el-button @click="cancel">取 消</el-button>-->
        </div>
      </el-dialog>

    </el-dialog>

    <!-- 增加库存 -->
    <el-dialog title="增加库存" :visible.sync="stockOpen" width="500px" append-to-body>
      <el-form ref="stockForm" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="添加库存">
          <el-input-number v-model="form.commodityStock" :min="1" :max="99999999" :controls="true"
                           controls-position="right"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAddStock">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    listCommodityInfo,
    getCommodityInfo,
    delCommodityInfo,
    addCommodityInfo,
    updateCommodityInfo,
    update2CommodityInfo,
    getSortTwoAll,
    delImg,
    releaseCommodityInfo,
    selectDealerList,
    delPartnelCommodityInfo
  } from "@/api/system/commodityInfo";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import {getToken} from "@/utils/auth";
  import {addCommodityStock} from "@/api/system/stock";

  export default {
    name: "CommodityInfo",
    components: {Treeselect},
    data() {
      return {
        header: {"Authorization": 'Bearer ' + getToken()},
        //上传图片
        fileList: [],
        //表单提交url
        url: process.env.VUE_APP_BASE_API + '/system/file/uploadImg/commodity',
        dialogVisible: false,
        dialogImageUrl: '',
        //商品详情图片
        detailImgList: [],
        tempCommodityImgs: [],
        tempCommodityDetailImgs:[],
        // 轮播图
        fileLists: [],
        stockOpen: false,
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
        //合伙人选择
        dealerOptions: [],
        // 是否显示弹出层
        open: false,
        // 是否弹出商品详情
        openDetail: false,
        // 合伙人下拉选是否禁用
        dealerStatus: false,
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
            {required: true, message: "合伙人不能为空", trigger: "blur"}
          ],
          dealerName: [
            {required: true, message: "合伙人名称不能为空", trigger: "blur"}
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
            {required: true, message: "商品图片不能为空", trigger: "change"}
          ],
          commodityImgs: [
            {required: true, message: "商品轮播图不能为空", trigger: "change"}
          ],
          commodityIsMember: [
            {required: true, message: "是否会员不能为空", trigger: "blur"}
          ],
          commodityIsCoupon: [
            {required: true, message: "是否会员不能为空", trigger: "blur"}
          ],
          /*commodityMemberPrice: [
            {required: true, message: "会员价不能为空", trigger: "blur"}
          ],
          commodityDetailImg: [
            {required: true, message: "详情图片不能为空", trigger: "change"}
          ],*/
          commodityDetail: [
            {required: true, message: "商品详述不能为空", trigger: "blur"}
          ],
          commodityPurchasePrice: [
            {required: true, message: "商品进货价不能为空", trigger: "blur"}
          ],
          commodityPartnerPrice: [
            {required: true, message: "合伙人拿货价不能为空", trigger: "blur"}
          ],
          commodityIncomePrice: [
            {required: true, message: "合伙人单笔收益不能为空", trigger: "blur"}
          ],
          commodityDealerPrice: [
            {required: true, message: "经销商单笔收益不能为空", trigger: "blur"}
          ],
        }
      };
    },
    created() {
      this.getList();
      this.getDicts("sys_yes_no").then(response => {
        this.commodityIsReleaseOptions = response.data;
        this.commodityIsMemberOptions = response.data;
      });
      getSortTwoAll().then(response => {
        this.commodityTypeOptions = response.data;
      });
      /** 查询合伙人列表 */
      selectDealerList().then(response => {
        if (response.code === 200) {
          this.dealerOptions = response.data;
        }
      });
    },
    methods: {
      /** 查询自营商品信息列表 */
      getList() {
        this.loading = true;
        listCommodityInfo(this.queryParams).then(response => {
          this.commodityInfoList = response.rows;
          this.total = response.total;
          this.loading = false;
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
      // 会员价格初始化
      handleMemberPriceFormatter(row, column, cellValue, index) {
        if (cellValue === 0 ) {
          return '';
        } else {
          return cellValue;
        }
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.openDetail = false;
        this.stockOpen = false;
        this.reset();
        this.fileList = [];
        this.fileLists = [];
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
          commodityStock: 1,
          commodityCapacity: null,
          commodityPrice: null,
          commodityIsRelease: null,
          commodityType: null,
          commodityKeyword: null,
          commodityImg: null,
          commodityImgs: null ,
          commodityIsMember: null,
          commodityMemberPrice: null,
          commodityDetailImg: null,
          commodityDetail: null,
          commodityIsCoupon: 'N',
          commodityPurchasePrice: 1,
          commodityPartnerPrice: null,
          commodityIncomePrice: null,
          commodityDealerPrice: null,
          params:{}
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
        this.single = selection.length !== 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.fileList = [];
        this.fileLists = [];
        this.detailImgList = [];
        this.open = true;
        this.title = "添加自营商品信息";
        this.dealerStatus = false;
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids
        getCommodityInfo(id).then(response => {
          this.form = response.data;
          this.fileList = [{
            name: this.form.commodityName,
            url: this.form.commodityImg
          }];
          this.fileLists = JSON.parse(this.form.commodityImgs);
          this.detailImgList = this.form.commodityDetailImg == null || this.form.commodityDetailImg == "" ? [] : JSON.parse(this.form.commodityDetailImg);
          this.open = true;
          this.title = "修改自营商品信息";
          this.form.dealerId = [this.form.dealerId];
          this.dealerStatus = true;
        });
      },

      /** 行添加商品详情操作*/
      handleCommodityDetail() {
        this.openDetail = true;
        this.titleDetail = "添加商品详情";
      },

      /** 提交按钮 */
      submitForm() {
        if (this.fileLists.length < 4 ) {
          this.msgError("请至少选择4张轮播图");
          return false;
        }
        if (this.form.commodityDetail == null || this.form.commodityDetail.length < 15) {
          this.msgError("详情描述至少输入15个文字");
          return false;
        }
        this.$refs["form"].validate(valid => {
          if (valid) {
            let imgs = [];
            let detailImgs = [];
            for (let i = 0; i < this.tempCommodityImgs.length; i++) {
              const data = this.tempCommodityImgs[i];
              if (data.response != null && data.response.data != null) {
                imgs.push({
                  url: data.response.data
                })
              } else {
                imgs.push({
                  url: data.url
                })
              }
            }
            for (let i = 0; i < this.tempCommodityDetailImgs.length; i++) {
              const data = this.tempCommodityDetailImgs[i];
              if (data.response != null && data.response.data != null) {
                detailImgs.push({
                  url: data.response.data
                })
              } else {
                detailImgs.push({
                  url: data.url
                })
              }
            }
            if (imgs.length > 0) {
              this.form.commodityImgs = JSON.stringify(imgs);
            } else {
              this.form.commodityImgs = null;
            }
            if (detailImgs.length > 0) {
              this.form.commodityDetailImg = JSON.stringify(detailImgs);
            } else {
              this.form.commodityDetailImg = null;
            }


            if (this.form.id != null) {
              this.form.dealerId = null;
              this.form.dealerName = null;
              updateCommodityInfo(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                }
              });
            } else {
              const dealerIds = this.form.dealerId;
              const dealerName = [];
              for (let i = 0; i < dealerIds.length; i++) {
                const dealerId = dealerIds[i];
                this.dealerOptions.map(item => {
                  if (item.dealerId === dealerId) {
                    dealerName.push(item.dealerName);
                  }
                })
                /*for (let j = 0; j < this.dealerOptions.length; j++) {
                  const map = this.dealerOptions[j];
                  if (map.dealerId === dealerId) {
                    dealerName.push(map.dealerName);
                  }
                }*/
              }
              this.form.dealerName = dealerName.join(',');
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
        this.openDetail = false;
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除自营商品信息编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delPartnelCommodityInfo(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },

      /** 上下架按钮操作 */
      handleBatchRelease(status) {
        const data = {
          commodityIds: this.ids.join(','),
          commodityIsRelease: status,
        }
        this.$confirm('是否确认将选中数据中商品进行' + (status === 'Y' ? '上' : '下') + '架', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return releaseCommodityInfo(data);
        }).then(() => {
          this.getList();
          this.msgSuccess("上架成功");
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
      //未发放商品量计算
      handleNotRelease(row, column, cellValue, index) {
        return row.commodityStock - row.commodityReleaseSum;
      },

      //新增库存
      handleAddStock() {
        this.form = {
          commodityStock: 1,
        };
        this.resetForm("form");
        this.stockOpen = true;
      },

      submitAddStock() {
        this.$refs["stockForm"].validate(valid => {
          if (valid) {
            const data = {
              ids: this.ids,
              commodityStock: this.form.commodityStock,
            }
            addCommodityStock(data).then(response => {
              if (response.code === 200) {
                this.msgSuccess("添加库存成功");
                this.stockOpen = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            })
          }
        })
      },

      //upload file 函数
      handleSeccess(response, file, fileList1) {
        if (response.code === 200) {
          //如果商品信息dialog打开,就是商品标题图
          if (this.open && !this.openDetail) {
            this.form.commodityImg = response.data;
            this.fileList = fileList1;
          }
          //如果时商品详情dialog打开,就是详情图
          else if (this.openDetail) {
            this.detailImgList = fileList1;
            //每次新增都添加都新增集合中
            this.tempCommodityDetailImgs = fileList1;
            this.form.commodityDetailImg = 'true';
          }
          //this.$refs.upload.clearFiles();
          this.msgSuccess("提交成功");
        } else {
          this.msgError("提交失败,请稍后重试");
        }
      },

      handleSeccess2(response, file, fileList1) {
        if (response.code === 200) {
          this.fileLists = fileList1;
          this.tempCommodityImgs = fileList1;
          this.form.commodityImgs = 'true';
          this.msgSuccess("提交成功");
        } else {
          this.msgError("提交失败,请稍后重试");
        }
      },

      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      handleError() {
        this.msgError("提交失败,请稍后重试");
      },

      handleRemove2(file1, fileList1) {
        this.fileLists = fileList1;
      },

      handleRemove(file1, fileList1) {
        //如果商品信息dialog打开,就是商品标题图
        if (this.open && !this.openDetail) {
          this.form.commodityImg = null;
          this.fileList = fileList1;
        }
        //如果时商品详情dialog打开,就是详情图
        else if (this.openDetail) {
          this.detailImgList = fileList1;
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

      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      //上传文件提交时
      beforeUpload(file) {
        return true;
      },

    }
  };
</script>
