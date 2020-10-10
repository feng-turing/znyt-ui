<template>
  <div class="app-container">

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['marketing:coupon:add']"
        >新增
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="couponList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" align="center" type="index"/>
      <el-table-column prop="title" label="优惠券名称" align="center"/>
      <el-table-column prop="type" label="优惠券类型" align="center">
        <template slot-scope="scope">
          <div>
            <el-tag v-if="scope.row.type === 1" style="cursor: pointer" :type="''">商品券</el-tag>
            <el-tag v-else :type=" 'info' ">满减券</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="couponPrice" label="优惠券面值" align="center"/>
      <el-table-column prop="useMinPrice" label="优惠券最低消费" align="center"/>
      <el-table-column label="优惠券有效期限" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.couponTime }}天</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" align="center"/>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <div>
            <el-tag v-if="scope.row.status === 1" style="cursor: pointer" :type="''">开启</el-tag>
            <el-tag v-else :type=" 'info' ">关闭</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="140" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-caret-top"
            @click="handleRelease(scope.row)"
            v-show="scope.row.status === 1"
          >发布
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['marketing:coupon:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['marketing:coupon:remove']"
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

    <!-- 添加或修改优惠券对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="150px">
        <el-form-item label="优惠券类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label=0>满减卷</el-radio>
            <el-radio :label=1>商品券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择商品" v-if="form.type == 1">
          <el-image v-for="img in productImgs" :key="img"
                    style="width: 100px; height: 100px"
                    :src="img"></el-image>
          <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAddGoods">添加商品</el-button>
        </el-form-item>

        <el-form-item label="优惠券名称" prop="title">
          <el-input v-model="form.title"/>
        </el-form-item>
        <el-form-item label="优惠券面值" prop="couponPrice">
          <el-input-number v-model="form.couponPrice"/>
        </el-form-item>
        <el-form-item label="优惠券最低消费" prop="useMinPrice">
          <el-input-number v-model="form.useMinPrice"/>
        </el-form-item>
        <el-form-item label="优惠券有效期限(天)" prop="couponTime">
          <el-input-number v-model="form.couponTime"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio v-model="form.status" :label="1">开启</el-radio>
          <el-radio v-model="form.status" :label="0">关闭</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
      <el-dialog width="70%" title="选择商品" :visible.sync="goodsOpen" append-to-body>
        <el-button type="primary" @click="addGoods">确 定</el-button>
        <el-table :data="commodityInfoList" @selection-change="handleGoodsSelectionChange">
          <el-table-column type="selection" width="55" align="center"/>
          <el-table-column label="序号" type="index" width="50" align="center"/>
          <el-table-column label="商品图片" align="center" prop="commodityImg">
            <template slot-scope="scope">
              <img :src="scope.row.commodityImg" style="height: 50px">
            </template>
          </el-table-column>
          <el-table-column label="商品名称" align="center" prop="commodityName"/>
          <el-table-column label="商品货号" align="center" prop="commodityGoodsCode"/>
          <el-table-column label="商品分类" align="center" prop="commodityType"/>
          <el-table-column label="商品价格" align="center" prop="commodityPrice"/>
          <el-table-column label="商品规格" align="center" prop="commodityCapacity"/>
        </el-table>
        <pagination
          v-show="total_goods>0"
          :total="total_goods"
          :page.sync="queryParams_goods.pageNum"
          :limit.sync="queryParams_goods.pageSize"
          @pagination="getGoodsList"
        />
      </el-dialog>
    </el-dialog>

    <!-- 添加或修改已发布优惠卷对话框 -->
    <el-dialog title="发布优惠券" :visible.sync="issueOpen" width="500px" append-to-body>
      <el-form ref="issueform" :model="issueform" :rules="issuerules" size="small" label-width="120px">
        <el-form-item label="优惠券ID">
          <el-input v-model="issueform.cid" style="width: 300px;" :disabled="true" />
          <el-input v-model="issueform.ctype"  v-show="false"/>
        </el-form-item>
        <el-form-item label="优惠券名称">
          <el-input v-model="issueform.cname" style="width: 300px;" :disabled="true" />
        </el-form-item>
        <el-form-item label="领取开启时间" prop="startDateTime">
          <template>
            <el-date-picker
              v-model="issueform.startDateTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              format="yyyy-MM-dd HH:mm"
            />
          </template>
        </el-form-item>
        <el-form-item label="券领结束时间" prop="endDateTime">
          <template>
            <el-date-picker
              v-model="issueform.endDateTime"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              format="yyyy-MM-dd HH:mm"
            />
          </template>
        </el-form-item>
        <el-form-item label="发布数量" prop="totalCount">
          <el-input v-model="issueform.totalCount" style="width: 300px;" />
        </el-form-item>
        <el-form-item label="是否不限量" >
          <el-radio v-model="issueform.isPermanent" :label="1">不限量</el-radio>
          <el-radio v-model="issueform.isPermanent" :label="0">限量</el-radio>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio v-model="issueform.status" :label="1">开启</el-radio>
          <el-radio v-model="issueform.status" :label="0">关闭</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="doSubmit">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {listCoupon, getCoupon, delCoupon, addCoupon, updateCoupon} from "@/api/marketing/coupon";
  import {listCommodityInfo} from "@/api/system/commodityInfo";
  import {isInteger} from "@/utils/validate";
  import {addCouponissue} from "@/api/marketing/couponissue";

  export default {
    name: "Coupon",
    data() {
      return {
        goodsOpen: false,
        // 自营商品信息表格数据
        commodityInfoList: [],
        // 商品总条数
        total_goods: 0,
        // 商品查询参数
        queryParams_goods: {
          pageNum: 1,
          pageSize: 10,
        },

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
        //商品图片集合
        productImgs: [],
        // 优惠券表格数据
        couponList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 发布弹出层
        issueOpen:false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
        },
        // 表单参数
        form: {},
        issueform: {
          id: '',
          cid: '',
          cname: '',
          ctype: 0,
          startDateTime: null,
          endDateTime: null,
          totalCount: 0,
          remainCount: 0,
          isPermanent: 0,
          status: 1,
          isDel: 0,
          addTime: ''
        },
        // 表单校验
        rules: {
          title: [
            {required: true, message: "优惠券名称不能为空", trigger: "blur"}
          ],
          integral: [
            {required: true, message: "兑换消耗积分值不能为空", trigger: "blur"}
          ],
          couponPrice: [
            {required: true, message: "兑换的优惠券面值不能为空", trigger: "blur"}
          ],
          useMinPrice: [
            {required: true, message: "最低消费多少金额可用优惠券不能为空", trigger: "blur"}
          ],
          couponTime: [
            {required: true, message: "优惠券有效期限不能为空", trigger: "blur"}
          ],
          status: [
            {required: true, message: "状态不能为空", trigger: "blur"}
          ],
          sort: [
            {required: true, message: "排序不能为空", trigger: "blur"}
          ],
        },
        issuerules: {
          startDateTime: [
            {required: true, message: "领取开启时间不能为空", trigger: "blur"}
          ],
          endDateTime: [
            {required: true, message: "券领结束时间不能为空", trigger: "blur"}
          ],
          totalCount: [
            {required: true, message: "发布数量不能为空", trigger: "blur"},
            {validator: isInteger, trigger: 'blur'}
          ],
        },

      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询优惠券列表 */
      getList() {
        this.loading = true;
        listCoupon(this.queryParams).then(response => {
          this.couponList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },
      //查询商品列表
      getGoodsList() {
        listCommodityInfo(this.queryParams_goods).then(response => {
          this.commodityInfoList = response.rows;
          this.total_goods = response.total;
        });
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.issueOpen = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          id: null,
          title: '',
          integral: null,
          couponPrice: 0,
          useMinPrice: 0,
          couponTime: 0,
          sort: 0,
          status: 1,
          productId: '',
          type: 0,
          createTime: null
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

      // 多选框选中数据
      handleGoodsSelectionChange(selection) {
        this.form.productId = selection.map(item => item.id);
        this.productImgs = selection.map(item => item.commodityImg);
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加优惠券";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids
        getCoupon(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改优惠券";
        });
      },
      /** 提交按钮 */
      submitForm() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.productId != null) {
              this.form.productId = this.form.productId.join(',');
            }
            if (this.form.id != null) {
              updateCoupon(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                }
              });
            } else {
              addCoupon(this.form).then(response => {
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
      //发布优惠卷
      doSubmit() {
        addCouponissue(this.issueform).then(response => {
          if (response.code === 200) {
            this.msgSuccess("新增成功");
            this.issueOpen = false;
          }
        });
      },

      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除优惠券编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delCoupon(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },
      /** 导出按钮操作 */
      handleExport() {
        this.download('marketing/coupon/export', {
          ...this.queryParams
        }, `marketing_coupon.xlsx`)
      },

      handleAddGoods() {
        this.goodsOpen = true;
        this.getGoodsList();
      },
      addGoods() {
        this.goodsOpen = false;
      },
      handleRelease(row) {
        this.issueform = {
          cid: row.id,
          cname: row.title,
          ctype: row.type,
          isPermanent: 0,
          status: 1,
          totalCount: 0,
          remainCount: 0,
          isDel: 0
        }
        this.issueOpen = true;
      }
    }
  };
</script>
