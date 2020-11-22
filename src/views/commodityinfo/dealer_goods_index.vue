<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commodityInfoList" @selection-change="handleSelectionChange" @cell-click="handleCellClick">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <el-table-column label="商品名称" align="center" prop="commodityName"/>
      <el-table-column label="商品价格" align="center" prop="commodityPrice"/>
      <el-table-column label="商品分类" align="center" prop="commodityType"/>
      <el-table-column label="商品库存" align="center" prop="commodityStock"/>
      <el-table-column label="经销商名称" align="center" prop="dealerName"/>
      <el-table-column label="是否上架" align="center" prop="commodityIsRelease" :formatter="commodityIsReleaseFormat"/>
      <el-table-column label="审核结果" align="center" prop="commodityStatus" >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.commodityStatus === 0 ? 'primary' : (scope.row.commodityStatus === 1 ? 'success' : 'danger')"
            disable-transitions>{{commodityStatusFormat(scope.row)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleApprove(scope.row)"
            v-show="scope.row.commodityStatus === 0"
          >审批</el-button>
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
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="经销商" prop="dealerId" >
              <el-select v-model="form.dealerId" multiple style="width: 99.99%" :disabled="dealerStatus">
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
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="commodityName">
              <el-input v-model="form.commodityName"  :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品货号" prop="commodityGoodsCode">
              <el-input v-model="form.commodityGoodsCode"  :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品库存" prop="commodityStock">
              <el-input-number v-model="form.commodityStock"  :min="1" :max="99999999"  :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品规格" prop="commodityCapacity">
              <el-input v-model="form.commodityCapacity"  :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品价格" prop="commodityPrice">
              <el-input-number v-model="form.commodityPrice"  :precision="2" :step="1" :max="99999999"  :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否上架" prop="commodityIsRelease">
              <el-select v-model="form.commodityIsRelease"  :disabled="true">
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
              <el-select v-model="form.commodityType"  :disabled="true" >
                <el-option
                  v-for="sort in commodityTypeOptions"
                  :key="sort.twoId"
                  :label="sort.twoName"
                  :value="sort.twoId"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关键词" prop="commodityKeyword">
              <el-input v-model="form.commodityKeyword"  :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品图片" prop="commodityImg">
              <el-image :src="form.commodityImg"></el-image>
            </el-form-item>
          </el-col>
          <!--<el-col :span="12">
              <el-form-item label="是否会员" prop="commodityIsMember">
                <el-radio-group v-model="form.commodityIsMember" :disabled="true">
                  <el-radio
                    v-for="dict in commodityIsMemberOptions"
                    :key="dict.dictValue"
                    :label="dict.dictValue"
                  >{{ dict.dictLabel }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            <el-form-item label="会员价" >
              <el-input-number v-model="form.commodityMemberPrice" :precision="2" :step="1" :max="99999999" :disabled="true" />
            </el-form-item>
            <el-form-item label="用优惠卷" prop="commodityIsCoupon" >
              <el-radio-group v-model="form.commodityIsCoupon" :disabled="true" >
                <el-radio
                  v-for="dict in commodityIsMemberOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>-->
          <el-row>
            <el-col :span="20">
              <el-form-item label="商品详情"  >
                <el-input v-model="form.commodityDetail" type="textarea" rows="3" :disabled="true"/>
              </el-form-item>
            </el-col>
            <el-col :span="4">
                <el-image
                  style="width: 80px; height: 80px"
                  :src="detailImgView"
                  :preview-src-list="detailImgViews">
                </el-image>
            </el-col>
          </el-row>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="审批意见"  >
              <el-input v-model="form.remark" type="textarea" rows="3" :disabled="opinionOpen"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="approve(1)" v-show="approveBtnOpen">同 意</el-button>
        <el-button type="danger" @click="approve(2)" v-show="approveBtnOpen">不同意</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listCommodityInfo, getCommodityInfo, delCommodityInfo, addCommodityInfo, updateCommodityInfo,update2CommodityInfo,  getSortTwoAll, delImg, releaseCommodityInfo, selectDealerList } from "@/api/system/commodityInfo";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import {getDealer} from "@/api/system/dealer";

export default {
  name: "CommodityInfo",
  components: { Treeselect },
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
      // 自营商品信息表格数据
      commodityInfoList: [],
      // 弹出层标题
      title: "",
      //经销商选择
      dealerOptions: [],
      // 是否显示弹出层
      open: false,
      // 是否弹出商品详情
      openDetail: false,
      // 经销商下拉选是否禁用
      dealerStatus: false,
      // 是否上架字典
      commodityIsReleaseOptions: [],
      // 是否会员字典
      commodityIsMemberOptions: [],
      // 商品分类字典
      commodityTypeOptions: [],
      // 商品审核状态
      commodityStatusOptions: [],
      // 是否会员 默认空
      isMember: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dealerName: null,
        commodityName: null,
        //是否自营默认值:否
        isSelfSupport: 'N',
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },

      //通过不通过按钮是否显示
      approveBtnOpen: true,
      //审批意见不可编辑
      opinionOpen: false,
      //详情第一张图
      detailImgView: '',
      //详情图集合
      detailImgViews: [],
      value1: '1',
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
    this.getDicts("sys_approve_status").then(response => {
      this.commodityStatusOptions = response.data;
    });
    getSortTwoAll().then(response => {
      this.commodityTypeOptions = response.data;
    });
  },

  methods: {
    /** 查询自营商品信息列表 */
    getList() {
      this.loading = true;
      this.getDealerList();
      listCommodityInfo(this.queryParams).then(response => {
        this.commodityInfoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询经销商列表 */
    getDealerList() {
      selectDealerList().then(response=>{
        if (response.code === 200) {
          this.dealerOptions = response.data;
        }
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
    // 审核结果字典翻译
    commodityStatusFormat(row, column) {
      return this.selectDictLabel(this.commodityStatusOptions, row.commodityStatus);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.openDetail = false;
      this.reset();
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
        commodityIsMember: null,
        commodityMemberPrice: null,
        commodityDetailImg: null,
        commodityDetail: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
        commodityIsCoupon: 'N'
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

    /** 修改按钮操作 */
    handleApprove(row) {
      this.reset();
      const commodityId = row.commodityId || this.ids
      this.opinionOpen = false;
      this.approveBtnOpen = true;
      getCommodityInfo(commodityId).then(response => {
        this.form = response.data;
        this.fileList=[{
          name: this.form.commodityName,
          url: this.form.commodityImg
        }];
        this.open = true;
        this.title = "审批商品";
        this.form.dealerId = [this.form.dealerId];
        this.dealerStatus = true;
        const detailImgs = JSON.parse(this.form.commodityDetailImg);
        for (let i = 0; i < detailImgs.length; i++) {
          const img = detailImgs[i];
          if (i === 0) {
            this.detailImgView = img.url;
          }
          this.detailImgViews.push(img.url);
        }
      });
    },

    /** 行审批*/
    approve(status) {
      if (status == 2 && (this.form.remark == null || this.form.remark == '')) {
        this.msgError('请输入审批意见');
        return;
      }
      const data = {
        commodityId: this.form.commodityId,
        commodityStatus: status,
        remark: this.form.remark,
      }
      updateCommodityInfo(data).then(response => {
        if (response.code === 200) {
          this.msgSuccess("审批成功");
          this.open = false;
          this.getList();
        }
      });
    },

    /** 当某个单元格被点击时会触发该事件 */
    handleCellClick(row, column, cell, event) {
      if (column.property === 'commodityStatus') {
        this.handleApprove(row);
        this.opinionOpen = true;
        this.approveBtnOpen = false;
      }
    }

  }
};
</script>
