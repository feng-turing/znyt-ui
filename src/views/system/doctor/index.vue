<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="医生姓名" prop="doctorName">
        <el-input
          v-model="queryParams.doctorName"
          placeholder="请输入医生姓名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="医生分类" prop="doctorType">
        <el-select v-model="queryParams.doctorType" placeholder="请选择医生分类" clearable size="small">
          <el-option
            v-for="dict in doctorTypeOptions"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:doctor:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:doctor:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:doctor:remove']"
        >删除</el-button>
      </el-col>
      <!--<el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:doctor:export']"
        >导出</el-button>
      </el-col>-->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="doctorList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="医生主键" align="center" prop="doctorId" />
      <el-table-column label="医生姓名" align="center" prop="doctorName" />
      <el-table-column label="医生手机号" align="center" prop="doctorPhone" />
      <el-table-column label="医生分类" align="center" prop="doctorType" :formatter="doctorTypeFormat" />
      <el-table-column label="医生标签" align="center" prop="doctorLabel" :formatter="doctorLabelFormat" />
      <el-table-column label="咨询价格" align="center" prop="doctorConsultingPrice" />
      <el-table-column label="咨询次数" align="center" prop="doctorConsultingNum" />
      <el-table-column label="医生简介" align="center" prop="remart" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:doctor:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:doctor:remove']"
          >删除</el-button>
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

    <!-- 添加或修改医生信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="医生姓名" prop="doctorName">
              <el-input v-model="form.doctorName" placeholder="请输入医生姓名"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="doctorPhone">
              <el-input v-model="form.doctorPhone" placeholder="请输入医生手机号"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="医生分类" prop="doctorType">
              <el-select v-model="form.doctorType" placeholder="请选择医生分类">
                <el-option
                  v-for="dict in doctorTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="咨询价格(元)" prop="doctorConsultingPrice">
              <el-input-number size="small" v-model="form.doctorConsultingPrice" :min="1" :max="9999999999" :controls="true" controls-position="right" placeholder="请输入咨询价格" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="24">
            <el-form-item label="医生标签" prop="doctorLabel">
              <el-checkbox-group v-model="form.doctorLabel">
                <el-checkbox
                  v-for="dict in doctorLabelOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue">
                  {{ dict.dictLabel }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="医生简介" prop="remart">
              <el-input v-model="form.remart" placeholder="请输入医生简介" type="textarea" rows="3"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDoctor, getDoctor, delDoctor, addDoctor, updateDoctor } from "@/api/system/doctor";
import {isPhone, isUrl} from "@/utils/validate";

export default {
  name: "Doctor",
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
      // 医生信息表格数据
      doctorList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 医生分类字典
      doctorTypeOptions: [],
      // 医生标签字典
      doctorLabelOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        doctorName: null,
        doctorType: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        doctorName: [
          {required: true, message: '医生姓名不能为空', trigger: "blur"},
        ],
        doctorPhone: [
          {required: true, message: "医生手机号不能为空", trigger: "blur"},
          {validator: isPhone, trigger: 'blur'}
        ],
        doctorType: [
          {required: true, message: "医生分类不能为空", trigger: "blur"},
        ],
        doctorConsultingPrice: [
          {required: true, type: 'number', message: "医生咨询价格不能为空", trigger: "blur"},
        ],
        doctorLabel: [
          {required: true, message: "医生咨询标签不能为空", trigger: "blur"},
        ],
      }
    };
  },
  created() {
    this.getList();
    this.getDicts("doctor_type").then(response => {
      this.doctorTypeOptions = response.data;
    });
    this.getDicts("doctor_label").then(response => {
      this.doctorLabelOptions = response.data;
    });
  },
  methods: {
    /** 查询医生信息列表 */
    getList() {
      this.loading = true;
      listDoctor(this.queryParams).then(response => {
        this.doctorList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 医生分类字典翻译
    doctorTypeFormat(row, column) {
      return this.selectDictLabel(this.doctorTypeOptions, row.doctorType);
    },
    // 医生标签字典翻译
    doctorLabelFormat(row, column) {
      return this.selectDictLabels(this.doctorLabelOptions, row.doctorLabel);
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        doctorId: null,
        doctorName: null,
        doctorPhone: null,
        doctorType: null,
        doctorLabel: [],
        doctorConsultingPrice: null,
        doctorConsultingNum: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remart: null
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
      this.ids = selection.map(item => item.doctorId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加医生信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const doctorId = row.doctorId || this.ids
      getDoctor(doctorId).then(response => {
        this.form = response.data;
        this.form.doctorLabel = this.form.doctorLabel.split(",");
        this.open = true;
        this.title = "修改医生信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.doctorLabel = this.form.doctorLabel.join(",");
          if (this.form.doctorId != null) {
            updateDoctor(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addDoctor(this.form).then(response => {
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
      const doctorIds = row.doctorId || this.ids;
      this.$confirm('是否确认删除医生信息编号为"' + doctorIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delDoctor(doctorIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/doctor/export', {
        ...this.queryParams
      }, `system_doctor.xlsx`)
    }
  }
};
</script>
