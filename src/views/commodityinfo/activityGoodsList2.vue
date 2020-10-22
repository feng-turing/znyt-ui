<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="经销商名称" prop="goodsInfoVo.dealer.dealerName">
        <el-input
          v-model="queryParams.goodsInfoVo.dealer.dealerName"
          placeholder="请输入经销商名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品名称" prop="goodsInfoVo.commodityName">
        <el-input
          v-model="queryParams.goodsInfoVo.commodityName"
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
          @click="handleAddGoods"
        >新增
        </el-button>
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDel"
        >删除
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="commodityInfoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="经销商名称" align="center" prop="goodsInfoVo.dealer.dealerName"/>
      <el-table-column label="经销商地址" align="center" prop="goodsInfoVo.dealer.dealerAddress"/>
      <el-table-column label="商品名称" align="center" prop="goodsInfoVo.commodityName"/>
      <el-table-column label="商品货号" align="center" prop="goodsInfoVo.commodityGoodsCode"/>
      <el-table-column label="商品分类" align="center" prop="goodsInfoVo.commodityType"/>
      <el-table-column label="商品价格（元）" align="center" prop="goodsInfoVo.commodityPrice"/>
      <el-table-column label="商品规格" align="center" prop="goodsInfoVo.commodityCapacity"/>
      <el-table-column label="商品库存" align="center" prop="goodsInfoVo.commodityStock"/>
      <el-table-column label="活动价格（元）" align="center" prop="activityPrice"/>
      <el-table-column label="活动排序" align="center" prop="activitySort"/>
      <el-table-column label="活动限购（个）" align="center" prop="activityLimitNum"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
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
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="商品活动价格" prop="activityPrice">
              <el-input-number v-model="form.activityPrice" :precision="2" :step="1" :max="99999999" :controls="false" /><span>元</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="推荐排序" prop="activitySort">
              <el-input-number v-model="form.activitySort" :controls="false"/>
            </el-form-item>
          </el-col>

        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="商品活动限购" prop="activityLimitNum">
              <el-input-number v-model="form.activityLimitNum" :step="1" :max="99999999" :controls="false" /><span>个</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <activity-goods-list-view2 ref="list" @ok="okCallBack"/>
  </div>
</template>

<script>
import {
  addActivitygoods,
  delActivitygoods, getActivitygoods,
  listActivitygoods, updateActivitygoods
} from "@/api/marketing/activitygoods";
import activityGoodsListView2 from './activityGoodsListView2'
  export default {
    name: "CommodityInfo",
    components: {activityGoodsListView2},
    data() {
      return {
        parentActivityAreaName: null,
        parentId: null,

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
        title: "选择商品",
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
          searchValue: null,
          goodsInfoVo: {
            commodityName: null,
            dealer: {
              dealerName: null,
            }
          }
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          activityPrice: [
            {type: 'number',required: true, message: "活动价格不能为空", trigger: "blur"}
          ],
          activitySort: [
            {type: 'number',required: true, message: "排序不能为空", trigger: "blur"}
          ],
          activityLimitNum: [
            {required: true, message: "活动限购不能为空", trigger: "blur"}
          ]
        },

        //选中数据对象
        templateSelection:{},
        //是否被选中，默认都是否
        templateRadio: false,
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
      //父级参数
      this.parentActivityAreaName = this.$route.query && this.$route.query.activityAreaName;
      this.queryParams.searchValue = this.parentActivityAreaName
      this.parentId = this.$route.query && this.$route.query.id;
      this.queryParams.activityInfoId = this.parentId
      this.parentType = this.$route.query && this.$route.query.type;

    },
    methods: {
      /** 查询自营商品信息列表 */
      getList() {
        this.loading = true;

        listActivitygoods(this.queryParams).then(response => {
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
        this.ids = selection.map(item => item.activityId)
        this.single = selection.length !== 1
        this.multiple = !selection.length
      },

      //获取选中数据
      getTemplateRow(index,row){
        this.templateSelection = row;
      },

      //头删除操作
      handleDel() {
        const ids = this.ids;
        this.$confirm('是否确认删除活动商品编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delActivitygoods(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
      },

      handleAddGoods() {
        this.$refs.list.show(this.parentActivityAreaName);
      },

      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const activityId = row.activityId || this.ids
        getActivitygoods(activityId).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改活动商品";
        });
      },

      //添加商品回调
      okCallBack(data) {
        //父级 活动类型(1:一元抢购,2:秒杀商品,3:清仓5:五折特惠)
        data.activityType = this.parentType;
        //活动信息主键
        data.activityInfoId = this.parentId;
        data.activityLimitNum = 1;
        addActivitygoods(data).then(response => {
          if (response.code === 200) {
            this.msgSuccess("新增成功");
            this.open = false;
            this.getList();
          }
        });
      },

      /** 提交按钮 */
      submitForm() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.activityPrice === 0){
              this.msgError('请输入大于 0 的活动价格');
              return;
            }
            if (this.form.activityId != null) {
              updateActivitygoods(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                }
              });
            } else {
              addActivitygoods(this.form).then(response => {
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
    }
  };
</script>
