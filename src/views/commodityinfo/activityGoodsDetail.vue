<template>
  <div class="app-container">
    <!-- 添加或修改自营商品信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :rules="rules" :model="form" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="选择商品">
              <el-image :src="addImg" style="width: 80px; height: 80px" @click="handleSelectAddGoods"></el-image>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="经销商" >
              <el-input v-model="form.dealerName" :disabled="true"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品名称">
              <el-input v-model="form.commodityName" :disabled="true" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品货号" >
              <el-input v-model="form.commodityGoodsCode" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品价格" >
              <el-input-number v-model="form.commodityPrice" :precision="2" :step="1" :max="99999999" :controls="false" :disabled="true" /><span>元</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品库存" >
              <el-input-number v-model="form.commodityStock" :min="1" :max="99999999" :controls="false" :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="商品详情" >
              <el-input type="textarea" v-model="form.commodityDetail" rows="3"  :disabled="true"/>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品活动价格" prop="activityPrice">
              <el-input-number v-model="form.activityPrice" :precision="2" :step="1" :max="99999999" :controls="false" /><span>元</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <activity-goods-list-view ref="list" @ok="handleAddGoods"/>
  </div>
</template>

<script>
  import {getSortTwoAll, selectDealerList} from "@/api/system/commodityInfo";
  import addImg from '@/assets/image/add.jpg'
  import activityGoodsListView from './activityGoodsListView'
  export default {
    name: "CommodityInfo",
    components: {activityGoodsListView},
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
        },
        // 表单参数
        form: {},
        rules: {
          activityPrice: [
            {required: true, message: "活动价格不能为空", trigger: "blur"}
          ]
        },

        //经销商选择
        dealerOptions: [],
        // 经销商下拉选是否禁用
        dealerStatus: false,
        //详情第一张图
        detailImgView: '',
        //详情图集合
        detailImgViews: [],
        //添加商品图片按钮
        addImg,
        // 提交表单
        submitForm: {
          activityCommodityId: null,
          activityPrice: null,
          activityId: null,
        }
      };
    },
    created() {
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
    // 审核状态
    commodityStatusFormat(commodityStatus) {
      switch (commodityStatus) {
        case 1 : return '审批通过';
        case 2 : return '审批未通过';
        default : return '待审批';
      }
    },
    methods: {
      /** 查询自营商品信息列表 */
      show(title, id) {
        this.title = title;
        this.open = true;
        this.submitForm.activityId = id;
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
        this.addImg = addImg;
        this.form = {};
        this.submitForm = {},
        this.resetForm("form");
      },
      //点击添加商品图片按钮
      handleSelectAddGoods(){
        this.$refs.list.show();
      },

      //商品列表页点击确定 回调参数
      handleAddGoods(row) {
        this.form = row;
        this.submitForm.activityCommodityId = row.commodityId;
        this.addImg = row.commodityImg;
      },

      //提交
      handleSubmitForm() {
        if (this.submitForm.activityCommodityId == null) {
          this.msgError('请选择商品');
          return;
        } else if (this.form.activityPrice === 0){
          this.msgError('请输入大于 0 的活动价格');
          return;
        }
        this.submitForm.dealerArea = this.form.dealer.dealerArea;
        this.submitForm.activityPrice = this.form.activityPrice;
        this.$emit('ok', this.submitForm);
        /*this.open = false;
        this.reset();*/
      }
    }
  };
</script>
