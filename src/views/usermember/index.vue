<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会员号" prop="memberNumber">
        <el-input
          v-model="queryParams.memberNumber"
          placeholder="请输入会员号"
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
      <!--<el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:usermember:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:usermember:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:usermember:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:usermember:export']"
        >导出</el-button>
      </el-col>-->
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="usermemberList" @selection-change="handleSelectionChange" @cell-click="handleAvatarView">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="主键" align="center" prop="userId" />-->
      <el-table-column label="主键" align="center" type="index" />
      <el-table-column label="用户头像" align="center" prop="avatar" >
        <template slot-scope="scope">
          <el-avatar :src="scope.row.avatar">{{scope.row.userName.substr(0,1)}}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="用户名" align="center" prop="userName" />
      <el-table-column label="注册时间" align="center" prop="userLoginTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.userLoginTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" prop="userPhonenumber" />
      <el-table-column label="微信号" align="center" prop="userWxId" />
      <el-table-column label="会员号" align="center" prop="memberNumber" />
      <el-table-column label="购买时间" align="center" prop="memberBuyTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.memberBuyTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-setting"
            v-show="scope.row.isMember !== 'Y'"
            @click="handleUpdateMember(scope.row)"
          >设为会员</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:usermember:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:usermember:remove']"
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

    <!-- 添加或修改用户会员对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="userPhonenumber">
              <el-input v-model="form.userPhonenumber" placeholder="请输入手机号"/>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>

          <el-col :span="12">
            <el-form-item label="微信号" prop="userWxId">
              <el-input v-model="form.userWxId" placeholder="请输入微信号"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="注册时间" prop="userLoginTime">
              <el-date-picker clearable size="small" style="width: 200px" :disabled="true"
                              v-model="form.userLoginTime"
                              type="date"
                              value-format="yyyy-MM-dd"
                              placeholder="选择注册时间">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-show="form.isMember === 'Y'">
          <el-col :span="24" align="center" style="margin-bottom: 5px;background-color: #dddddd">
            以下是会员信息
          </el-col>
        </el-row>
        <el-row v-show="form.isMember === 'Y'">
          <el-col :span="12">
            <el-form-item label="会员号" prop="memberNumber">
              <el-input v-model="form.memberNumber" :disabled="true"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购买时间" prop="memberBuyTime">
              <el-date-picker clearable size="small" style="width: 200px" :disabled="true"
                              v-model="form.memberBuyTime"
                              type="date"
                              value-format="yyyy-MM-dd">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogVisible" :modal="false">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
import { listUsermember, getUsermember, delUsermember, addUsermember, updateUsermember, userLoginMember } from "@/api/system/usermember";

export default {
  name: "Usermember",
  data() {
    return {
      //看图使用
      dialogVisible: false,
      dialogImageUrl: '',
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
      // 用户会员表格数据
      usermemberList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: null,
        memberNumber: null,
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
  },
  methods: {
    /** 查询用户会员列表 */
    getList() {
      this.loading = true;
      listUsermember(this.queryParams).then(response => {
        this.usermemberList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        userId: null,
        userName: null,
        userLoginTime: null,
        userPhonenumber: null,
        userWxId: null,
        isMember: null,
        memberNumber: null,
        memberBuyTime: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
      this.ids = selection.map(item => item.userId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加用户会员";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const userId = row.userId || this.ids
      getUsermember(userId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改用户会员";
      });
    },

    /** 将用户变为会员 */
    handleUpdateMember(row) {
      this.reset();
      const userId = row.userId || this.ids
      userLoginMember(userId).then(response => {
        if (response.code === 200) {
          this.msgSuccess("设置会员成功");
          this.open = false;
          this.getList();
        }
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.userId != null) {
            updateUsermember(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addUsermember(this.form).then(response => {
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
      const userIds = row.userId || this.ids;
      this.$confirm('是否确认删除用户会员编号为"' + userIds + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delUsermember(userIds);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/usermember/export', {
        ...this.queryParams
      }, `system_usermember.xlsx`)
    },

    handleAvatarView(row, column, cell, event) {
      if (column.property === 'avatar') {
        this.dialogImageUrl = row.avatar;
        this.dialogVisible = true;
      }
    }
  }
};
</script>
