<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="提现状态" prop="extractStatus">
        <el-select v-model="queryParams.extractStatus" placeholder="请选择提现状态" clearable size="small">
          <el-option
            v-for="dict in extractStatusOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="dealerRealName">
        <el-input
          v-model="queryParams.dealerRealName"
          placeholder="请输入姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="电话" prop="dealerPhone">
        <el-input
          v-model="queryParams.dealerPhone"
          placeholder="请输入电话"
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

    <!--<el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['usercenter:extract:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['usercenter:extract:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['usercenter:extract:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['usercenter:extract:export']"
        >导出</el-button>
      </el-col>
    </el-row>-->
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>

    <el-table v-loading="loading" :data="extractList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" type="index" />
      <el-table-column label="用户名" align="center" prop="dealerInfo.dealerRealName" />
      <el-table-column label="手机号" align="center" prop="dealerInfo.dealerPhone" />
      <el-table-column label="角色" align="center" prop="dealerId" :formatter="function(row, column, cellValue, index) {
        if (cellValue === 'N') {
          return '经销商';
        } else {
          return '合伙人';
        }
      }"/>
      <el-table-column label="提现金额" align="center" prop="extractMoney" />
      <el-table-column label="归属银行" align="center" prop="extractBankName" />
      <el-table-column label="银行卡号" align="center" prop="extractBankCardNum" />
      <el-table-column label="持卡人姓名" align="center" prop="extractBankCardName" />
      <el-table-column label="提现申请时间" align="center" prop="extractTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.extractTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提现完成时间" align="center" prop="extractOkTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.extractOkTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="提现状态" align="center" prop="extractStatus" :formatter="extractStatusFormat" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-show="scope.row.extractStatus !== '1'"
            size="mini"
            type="text"
            icon="el-icon-success"
            @click="handleExtractSuccess(scope.row)"
            v-hasPermi="['usercenter:extract:edit']"
          >提现完成</el-button>
          <!--<el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['usercenter:extract:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['usercenter:extract:remove']"
          >删除</el-button>-->
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

    <!-- 添加或修改提现管理对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="合伙人" prop="dealerId">
          <el-input v-model="form.dealerId" placeholder="请输入合伙人" />
        </el-form-item>
        <el-form-item label="提现金额" prop="extractMoney">
          <el-input v-model="form.extractMoney" placeholder="请输入提现金额" />
        </el-form-item>
        <el-form-item label="归属银行" prop="extractBankName">
          <el-input v-model="form.extractBankName" placeholder="请输入归属银行" />
        </el-form-item>
        <el-form-item label="银行卡号" prop="extractBankCardNum">
          <el-input v-model="form.extractBankCardNum" placeholder="请输入银行卡号" />
        </el-form-item>
        <el-form-item label="持卡人姓名" prop="extractBankCardName">
          <el-input v-model="form.extractBankCardName" placeholder="请输入持卡人姓名" />
        </el-form-item>
        <el-form-item label="提现申请时间" prop="extractTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.extractTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择提现申请时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="提现完成时间" prop="extractOkTime">
          <el-date-picker clearable size="small" style="width: 200px"
            v-model="form.extractOkTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择提现完成时间">
          </el-date-picker>
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
import { listExtract, getExtract, delExtract, addExtract, updateExtract } from "@/api/usercenter/extract";

export default {
  name: "Extract",
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
      // 提现管理表格数据
      extractList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 提现状态字典
      extractStatusOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        extractStatus: null,
        dealerInfo: null,
        dealerRealName: null,
        dealerPhone: null,
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
    this.getDicts("yf_dealer_extract_status").then(response => {
      this.extractStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询提现管理列表 */
    getList() {
      this.loading = true;
      listExtract(this.queryParams).then(response => {
        this.extractList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 提现状态字典翻译
    extractStatusFormat(row, column) {
      return this.selectDictLabel(this.extractStatusOptions, row.extractStatus);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        dealerId: null,
        extractMoney: null,
        extractBankName: null,
        extractBankCardNum: null,
        extractBankCardName: null,
        extractTime: null,
        extractOkTime: null,
        extractStatus: null
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加提现管理";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getExtract(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改提现管理";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateExtract(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addExtract(this.form).then(response => {
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
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除提现管理编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delExtract(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('usercenter/extract/export', {
        ...this.queryParams
      }, `usercenter_extract.xlsx`)
    },

    // 提现成功按钮
    handleExtractSuccess(row) {
      const data = {
        id: row.id,
        extractStatus: '1',
      }
      updateExtract(data).then(response => {
        if (response.code === 200) {
          this.msgSuccess("提现成功");
          this.getList();
        }
      });
    }
  }
};
</script>
