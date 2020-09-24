<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          :disabled="multiple"
          @click="handleAddStock"
        >批量添加库存
        </el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="stock" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="序号" type="index" width="50" align="center"/>
      <el-table-column label="产品编号" align="center" prop="commodityGoodsCode"/>
      <el-table-column label="产品名称" align="center" prop="commodityName"/>
      <el-table-column label="产品规格" align="center" prop="commodityCapacity" />
      <el-table-column label="类别" align="center" prop="commodityType"/>
      <el-table-column label="经销商" align="center" prop="dealerName"/>
      <el-table-column label="商品库存" align="center" prop="commodityStock" />
    </el-table>

    <!-- 添加或修改搜索热词对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="添加库存" prop="commodityStock">
          <el-input v-model="form.commodityStock" placeholder="添加库存数" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
import {
  detailStockInfo, addCommodityStock } from "@/api/system/stock";
import {getToken} from "@/utils/auth";

export default {
  name: "CommodityInfo",
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
      stock: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否会员 默认空
      isMember: true,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        commodityStock: [
          {required: true, message: "新增库存数不能为空", trigger: "blur"}
        ],
      }
    };
  },
  created() {
    const commodityGoodsCode = this.$route.params && this.$route.params.commodityGoodsCode;
    this.queryParams.commodityGoodsCode = commodityGoodsCode;
    this.getList();
  },
  methods: {
    /** 查询自营商品信息列表 */
    getList() {
      this.loading = true;
      detailStockInfo(this.queryParams).then(response => {
        this.stock = response.rows;
        this.total = response.total;
        this.loading = false;
      });
      this.cancel();
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.form = {
        commodityGoodsCode: null,
        commodityStock: null,
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

    /** 导出按钮操作 */
    handleExport() {
      this.download('system/commodityInfo/export', {
        ...this.queryParams
      }, `system_commodityInfo.xlsx`)
    },
    /** 添加库存*/
    handleAddStock() {
      this.form.commodityIds = this.ids;
      this.open = true;
    },

    /** 提交*/
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          addCommodityStock(this.form).then(response=>{
            if (response.code === 200) {
              this.msgSuccess("添加库存成功");
              this.open = false;
              this.getList();
            } else {
              this.msgError(response.msg);
            }
          })
        }
      })
    }



  }
};
</script>
