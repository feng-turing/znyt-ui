<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="经销商地区" >
        <el-cascader
          :options="options"
          :props="props"
          v-model="tempCity"
          :collapse-tags="false"
          show-all-levels
          filterable
          clearable></el-cascader>
      </el-form-item>
      <el-form-item label="经销商名称" >
        <el-input
          v-model="queryParams.dealerName"
          placeholder="请输入经销商名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称">
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
          icon="el-icon-top"
          size="mini"
          :disabled="multiple"
          @click="handleBatchRelease"
        >批量上架
        </el-button>
        <el-button
          type="danger"
          icon="el-icon-top"
          size="mini"
          :disabled="multiple"
          @click="handleBatchRelease({}, 'N')"
        >批量下架
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commodityInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <!--      <el-table-column label="经销商id" align="center" prop="dealerId" />-->
      <el-table-column label="经销商名称" align="center" prop="dealer.dealerName"/>
      <el-table-column label="经销商地址" align="center" prop="dealer.dealerAddress"/>
      <el-table-column label="商品名称" align="center" prop="commodityName"/>
      <el-table-column label="商品货号" align="center" prop="commodityGoodsCode"/>
      <el-table-column label="商品分类" align="center" prop="commodityType"/>
      <el-table-column label="商品价格" align="center" prop="commodityPrice"/>
      <el-table-column label="商品规格" align="center" prop="commodityCapacity" />
      <el-table-column label="商品库存" align="center" prop="commodityStock"/>
      <el-table-column label="是否上架" align="center" prop="commodityIsRelease">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.commodityIsRelease === 'Y' ? 'success' : 'danger'"
            disable-transitions>{{commodityIsReleaseFormat(scope.row)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="commodityStatus">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.commodityStatus === 0 ? 'primary' : (scope.row.commodityStatus === 1 ? 'success' : 'danger')"
            disable-transitions>{{commodityStatusFormat(scope.row.commodityStatus)}}</el-tag>
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
          <el-button v-show="scope.row.commodityIsRelease === 'N' && scope.row.commodityStatus === 1"
                     size="mini"
                     type="text"
                     icon="el-icon-top"
                     @click="handleBatchRelease(scope.row, 'Y')"
          >上架
          </el-button>
          <el-button v-show="scope.row.commodityIsRelease === 'Y' && scope.row.commodityStatus === 1"
                     size="mini"
                     type="text"
                     icon="el-icon-bottom"
                     @click="handleBatchRelease(scope.row, 'N')"
          >下架
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
          <!--<el-col :span="12">
            <el-form-item label="关键词" prop="commodityKeyword">
              <el-input v-model="form.commodityKeyword"  :disabled="true"/>
            </el-form-item>
          </el-col>-->
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
    listDealerCommodityInfo,getDealerCommodityInfo,updateCommodityInfo } from "@/api/system/dealerCommodityInfo";
  import {
    releaseCommodityInfo } from "@/api/system/stock";
  import {CodeToText, provinceAndCityData} from "element-china-area-data";
  export default {
    name: "CommodityInfo",
    data() {
      return {
        //地区省市联动
        props: { multiple: false },
        options: provinceAndCityData,
        tempCity: null,

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
        // 是否显示弹出层
        open: false,
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
          commodityName: null,
          dealerName: null,
          searchValue: null,
          isSelfSupport: 'N',
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
        },

        //经销商选择
        dealerOptions: [],
        // 经销商下拉选是否禁用
        dealerStatus: false,
        //通过不通过按钮是否显示
        approveBtnOpen: true,
        //审批意见不可编辑
        opinionOpen: false,
        //详情第一张图
        detailImgView: '',
        //详情图集合
        detailImgViews: [],
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
    },
    methods: {
      /** 查询自营商品信息列表 */
      getList() {
        this.loading = true;
        //获取当前选择的市，进行模糊查询
        if (this.tempCity != null) {
          this.queryParams.searchValue = CodeToText[this.tempCity[this.tempCity.length-1]]
        } else {
          this.queryParams.searchValue = null;
        }

        listDealerCommodityInfo(this.queryParams).then(response => {
          this.commodityInfoList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },

      // 审核状态
      commodityStatusFormat(commodityStatus) {
        switch (commodityStatus) {
          case 1 : return '审批通过';
          case 2 : return '审批未通过';
          default : return '待审批';
        }
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
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
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
        this.tempCity= null;
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.commodityId)
        this.single = selection.length !== 1
        this.multiple = !selection.length
      },


      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除自营商品信息编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delCommodityInfo(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },

      /** 上下架按钮操作 */
      handleBatchRelease(row,status = 'Y') {
        console.log(row);
        const ids = row.commodityId || this.ids.join(',');
        const data = {
          commodityIds: ids,
          commodityIsRelease: status,
        }
        this.$confirm('是否确认将选中数据中商品进行'+(status==='Y'?'上':'下')+'架', "警告", {
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

      /** 修改按钮操作 */
      handleApprove(row) {
        this.reset();
        const commodityId = row.commodityId || this.ids
        this.opinionOpen = false;
        this.approveBtnOpen = true;
        getDealerCommodityInfo(commodityId).then(response => {
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
      approve(status){
        if (status === 2 && (this.form.remark == null || this.form.remark == '')) {
          this.msgInfo("请输入审批意见");
          return;
        }
        const data = {
          commodityId: this.form.commodityId,
          remark: this.form.remark,
          commodityStatus: status,
        }
        updateCommodityInfo(data).then(result => {
          if (result.code === 200) {
            this.msgSuccess("操作成功");
            this.open = false;
            this.getList();
          } else {
            this.msgError(result.msg);
          }
        })
      }
    }
  };
</script>
