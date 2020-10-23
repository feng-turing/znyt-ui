<template>
  <div class="app-container">
    <el-tabs tab-position="left" style="height: 100%;" :before-leave="tabsBefore">
      <el-tab-pane label="经销商管理">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
          <el-form-item label="地区" prop="advertArea" >
            <el-cascader
              :options="options"
              :props="props"
              v-model="tempCity"
              :collapse-tags="false"
              show-all-levels
              filterable
              clearable></el-cascader>
          </el-form-item>
          <el-form-item label="商家名称" prop="dealerName">
            <el-input
              v-model="queryParams.dealerName"
              placeholder="请输入商家名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>

          <el-form-item label="商家分类" prop="dealerType">
            <el-select v-model="queryParams.dealerType" placeholder="请选择商家分类" clearable size="small">
              <el-option
                v-for="dict in dealerTypeOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审核结果" prop="dealerStatus">
            <el-select v-model="queryParams.dealerStatus" placeholder="请选择审核结果" clearable size="small">
              <el-option
                v-for="dict in dealerStatusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="推荐码" prop="dealerPartnerId">
            <el-input
              v-model="queryParams.dealerPartnerId"
              placeholder="请输入合伙人推荐码"
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
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        <div><span>
          <span style="color: #409EFF; font-weight: bold">【{{ cityName }}】</span>共有<span
          style="color: #F56C6C; font-weight: bold">【{{ total }}】</span>家经销商入驻
        </span></div>
        <el-table v-loading="loading" :data="dealerList" @selection-change="handleSelectionChange" @cell-click="handleCellClick">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="序号" align="center" type="index" />
          <el-table-column label="商家名称" align="center" prop="dealerName" />
          <el-table-column label="商家地址" align="center" prop="dealerAddress" />
          <el-table-column label="经度" align="center" prop="dealerLong" />
          <el-table-column label="纬度" align="center" prop="dealerLat" />
          <el-table-column label="商家电话" align="center" prop="dealerPhone" />
          <el-table-column label="商家分类" align="center" prop="dealerType" :formatter="dealerTypeFormat" />
          <el-table-column label="审核结果" align="center" prop="dealerStatus" >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.dealerStatus === 0 ? 'primary' : (scope.row.dealerStatus === 1 ? 'success' : 'danger')"
                disable-transitions>{{dealerStatusFormat(scope.row)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="合伙人" align="center" prop="partnerName" />
          <el-table-column label="合伙人推荐码" align="center" prop="dealerPartnerId" />
          <el-table-column label="保证金" align="center" prop="dealerMargin" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-setting"
                @click="handleSettingMargin(scope.row)"
                v-show="scope.row.dealerMargin === 0"
              >设置保证金</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleApprove(scope.row)"
                v-show="scope.row.dealerStatus === 0"
              >审批</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['system:dealer:remove']"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="合伙人管理">
        <el-form :model="queryParams" ref="queryFormPartnel" :inline="true" v-show="showSearch" label-width="90px">
          <el-form-item label="地区" prop="advertArea" >
            <el-cascader
              :options="options"
              :props="props"
              v-model="tempCity"
              :collapse-tags="false"
              show-all-levels
              filterable
              clearable></el-cascader>
          </el-form-item>
          <el-form-item label="合伙人名称" prop="dealerName" >
            <el-input
              v-model="queryParams.dealerName"
              placeholder="合伙人名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="合伙人电话" prop="dealerPhone">
            <el-input
              v-model="queryParams.dealerPhone"
              placeholder="合伙人电话"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="审核结果" prop="dealerStatus">
            <el-select v-model="queryParams.dealerStatus" placeholder="请选择审核结果" clearable size="small">
              <el-option
                v-for="dict in dealerStatusOptions"
                :key="dict.dictValue"
                :label="dict.dictLabel"
                :value="dict.dictValue"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        <el-table v-loading="loading" :data="dealerList" @selection-change="handleSelectionChange" @cell-click="handleCellClick">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="序号" align="center" type="index" />
          <el-table-column label="合伙人名称" align="center" prop="dealerName" />
          <el-table-column label="合伙人地址" align="center" prop="dealerAddress" />
          <el-table-column label="经度" align="center" prop="dealerLong" />
          <el-table-column label="纬度" align="center" prop="dealerLat" />
          <el-table-column label="合伙人电话" align="center" prop="dealerPhone" />
<!--          <el-table-column label="商家分类" align="center" prop="dealerType" :formatter="dealerTypeFormat" />-->
          <el-table-column label="审核结果" align="center" prop="dealerStatus" >
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.dealerStatus === 0 ? 'primary' : (scope.row.dealerStatus === 1 ? 'success' : 'danger')"
                disable-transitions>{{dealerStatusFormat(scope.row)}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数量" align="center" prop="partnerSum" />
          <el-table-column label="推荐码" align="center" prop="dealerPartnerId" />
          <el-table-column label="保证金" align="center" prop="dealerMargin" />

          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-setting"
                @click="handleSettingMargin(scope.row)"
                v-show="scope.row.dealerMargin === 0"
              >设置保证金</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleApprove(scope.row)"
                v-show="scope.row.dealerStatus === 0"
              >审批</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['system:dealer:remove']"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>


    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!--审批经销商-->
    <el-dialog :title="approveTitle" :visible.sync="approveOpen" width="1000px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
<!--        <el-form-item label="商家区域" prop="dealerArea">-->
<!--          <el-input v-model="form.dealerArea" placeholder="请输入商家区域" />-->
<!--        </el-form-item>-->
        <el-row>
          <el-col :span="12">
            <el-form-item label="商家名称" >
              <el-input v-model="form.dealerName"  :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商家分类" >
              <el-select v-model="form.dealerType" :disabled="true">
                <el-option
                  v-for="dict in dealerTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="商家地址" >
              <el-input v-model="form.dealerAddress" type="textarea" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="营业时间" >
              <el-input v-model="form.dealerBusinessHours"  :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商家电话"  >
              <el-input v-model="form.dealerPhone" :disabled="true" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="经度" >
              <el-input v-model="form.dealerLong" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度"  >
              <el-input v-model="form.dealerLat" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="真实姓名" >
              <el-input v-model="form.dealerRealName" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" >
              <el-input v-model="form.dealerIdCard" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商家图片" >
              <el-image
                style="width: 100px; height: 100px"
                :src="form.dealerImg"
                :preview-src-list="form.dealerImgs">
              </el-image>
            </el-form-item>

          </el-col>
          <el-col :span="12">
            <el-form-item label="营业执照" >
              <el-image
                style="width: 100px; height: 100px"
                :src="form.dealerUniqueCodeImg"
                :preview-src-list="form.dealerUniqueCodeImgs">
              </el-image>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="推荐码" >
              <el-input v-model="form.dealerPartnerId" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="审核结果" >
              <el-select v-model="form.dealerStatus" :disabled="true">
                <el-option
                  v-for="dict in dealerStatusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="parseInt(dict.dictValue)"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="审批意见"  >
              <el-input v-model="form.dealerApproveOpinion" type="textarea" rows="3" :disabled="!btnStatus"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" v-if="btnStatus" @click="approve(1)">同 意</el-button>
        <el-button type="danger" v-if="btnStatus" @click="approve(2)">不同意</el-button>
        <el-button @click="cancel">关 闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="保证金" prop="dealerMargin">
          <el-input-number v-model="form.dealerMargin" :step="1" :max="99999999" :controls="false" /><span>元</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">关 闭</el-button>
      </div>


    </el-dialog>

  </div>
</template>

<script>
import { listDealer, getDealer, delDealer, addDealer, updateDealer } from "@/api/system/dealer";
import { provinceAndCityData, regionData, provinceAndCityDataPlus, regionDataPlus, CodeToText, TextToCode } from 'element-china-area-data'

export default {
  name: "Dealer",
  data() {
    return {
      cityName: '所有市',
      //地区省市联动
      props: { multiple: false },
      options: provinceAndCityData,
      tempCity: null,
      btnStatus: true,
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
      // 经销商信息表格数据
      dealerList: [],
      // 弹出层标题
      title: "",
      //审批弹出层标题
      approveTitle: "",
      // 是否显示弹出层
      open: false,
      // 是否显示审批弹出层
      approveOpen: false,
      // 商家分类字典
      dealerTypeOptions: [],
      // 审核结果字典
      dealerStatusOptions: [],
      // 是否合伙人(Y:是,N:不是)字典
      isPartnerOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dealerName: null,
        dealerPhone: null,
        dealerType: null,
        dealerStatus: null,
        dealerPartnerId: null,
        isPartner: 'N',
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_dealer_type").then(response => {
      this.dealerTypeOptions = response.data;
    });
    this.getDicts("sys_approve_status").then(response => {
      this.dealerStatusOptions = response.data;
    });
    this.getDicts("sys_yes_no").then(response => {
      this.isPartnerOptions = response.data;
    });
  },
  methods: {
    /** 查询经销商信息列表 */
    getList() {
      this.loading = true;
      //获取当前选择的市，进行模糊查询
      if (this.tempCity != null) {
        this.queryParams.dealerArea = CodeToText[this.tempCity[this.tempCity.length-1]]
      } else {
        this.queryParams.dealerArea = null;
      }
      listDealer(this.queryParams).then(response => {
        this.dealerList = response.rows;
        this.total = response.total;
        if (this.queryParams.dealerArea == null || this.queryParams.dealerArea == 'undefined') {
          this.cityName = '所有市';
        } else {
          this.cityName = this.queryParams.dealerArea;
        }
        this.loading = false;
      });
    },
    // 商家分类字典翻译
    dealerTypeFormat(row, column) {
      return this.selectDictLabel(this.dealerTypeOptions, row.dealerType);
    },
    // 审核结果字典翻译
    dealerStatusFormat(row, column) {
      return this.selectDictLabel(this.dealerStatusOptions, row.dealerStatus);
    },
    // 是否合伙人(Y:是,N:不是)字典翻译
    isPartnerFormat(row, column) {
      return this.selectDictLabel(this.isPartnerOptions, row.isPartner);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.approveOpen = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.tempCity= null;
      this.form = {
        dealerId: null,
        dealerName: null,
        dealerArea: null,
        dealerAddress: null,
        dealerLong: null,
        dealerLat: null,
        dealerPhone: null,
        dealerType: null,
        dealerRealName: null,
        dealerIdCard: null,
        dealerBusinessHours: null,
        dealerImg: null,
        dealerUniqueCodeImg: null,
        dealerStatus: null,
        dealerWxId: null,
        dealerPartnerId: null,
        dealerApproveOpinion: null,
        isPartner: null,
        delFlag: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.isPartner = 'N';
      this.getList();
    },
    /** 搜索按钮操作 */
    handleQueryPartnel() {
      this.queryParams.pageNum = 1;
      this.isPartner = 'Y';
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.tempCity= null;
      this.resetForm("queryForm");
      this.resetForm("queryFormPartnel");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dealerId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加经销商信息";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const dealerId = row.dealerId || this.ids
      getDealer(dealerId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改经销商信息";
      });
    },

    /** 设置保证金 */
    handleSettingMargin(row) {
      this.reset();
      this.form.dealerId = row.dealerId;
      this.open = true;
    },

    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.dealerId != null) {
            updateDealer(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addDealer(this.form).then(response => {
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
      const dealerIds = row.dealerId || this.ids;
      this.$confirm('是否确认删除经销商信息编号为"' + dealerIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delDealer(dealerIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/dealer/export', {
        ...this.queryParams
      }, `system_dealer.xlsx`)
    },

    /** 行审批*/
    approve(status) {
      if (status == 2 && (this.form.dealerApproveOpinion == null || this.form.dealerApproveOpinion == '')) {
        this.msgError('请输入审批意见');
        return;
      }
      const data = {
        dealerId: this.form.dealerId,
        dealerStatus: status,
        dealerApproveOpinion: this.form.dealerApproveOpinion,
      }
      updateDealer(data).then(response => {
        if (response.code === 200) {
          this.msgSuccess("审批成功");
          this.approveOpen = false;
          this.getList();
        }
      });
    },
    /** tabs标签页切换before*/
    tabsBefore(activeName, oldActiveName) {
      if (activeName === '0') {
        this.queryParams.isPartner='N';
      } else {
        this.queryParams.isPartner='Y';
      }
      this.getList();
    },

    /** 审批按钮操作 */
    handleApprove(row) {
      this.reset();
      const dealerId = row.dealerId || this.ids
      getDealer(dealerId).then(response => {
        this.form = response.data;
        this.form.dealerImgs = [this.form.dealerImg];
        this.form.dealerUniqueCodeImgs = [this.form.dealerUniqueCodeImg];
        this.approveOpen = true;
        this.btnStatus = true;
        this.appeoveTitle = "";
      });
    },

    /** 当某个单元格被点击时会触发该事件 */
    handleCellClick(row, column, cell, event) {
      if (column.property === 'dealerStatus') {
        this.reset();
        const dealerId = row.dealerId || this.ids
        getDealer(dealerId).then(response => {
          this.form = response.data;
          this.form.dealerImgs = [this.form.dealerImg];
          this.form.dealerUniqueCodeImgs = [this.form.dealerUniqueCodeImg];
          this.approveOpen = true;
          this.btnStatus = false;
          this.appeoveTitle = "";
        });
      }
    },

  }
};
</script>
