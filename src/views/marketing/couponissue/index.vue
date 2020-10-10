<template>
  <div class="app-container">

    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>

    <el-table v-loading="loading" :data="couponissueList" @selection-change="handleSelectionChange">
      <el-table-column prop="ctype" label="优惠券类型">
        <template slot-scope="scope">
          <div>
            <el-tag v-if="scope.row.ctype === 1" style="cursor: pointer" :type="''">商品券</el-tag>
            <el-tag v-else :type=" 'info' ">普通券</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="cname" label="优惠券名称" />
      <el-table-column label="领取日期" prop="startTime">
        <template slot-scope="scope">
          <p>{{ formatTimeTwo(scope.row.startDateTime) }}</p>
          <p>{{ formatTimeTwo(scope.row.endDateTime) }}</p>
        </template>
      </el-table-column>
      <el-table-column label="发布数量" prop="totalCount">
        <template slot-scope="scope">
          <p>发布:{{ scope.row.totalCount }}</p>
          <p>剩余:{{ scope.row.remainCount }}</p>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <div>
            <el-tag v-if="scope.row.status === 1" style="cursor: pointer" :type="''">开启</el-tag>
            <el-tag v-else :type=" 'info' ">关闭</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['marketing:couponissue:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['marketing:couponissue:remove']"
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

    <!-- 添加或修改已发布优惠卷对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="状态">
        <el-radio v-model="form.status" :label="1">开启</el-radio>
        <el-radio v-model="form.status" :label="0">关闭</el-radio>
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
import { listCouponissue, getCouponissue, delCouponissue, addCouponissue, updateCouponissue } from "@/api/marketing/couponissue";
export default {
  name: "Couponissue",
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
      // 已发布优惠卷表格数据
      couponissueList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        startDateTime: [
          { required: true, message: "优惠券领取开启时间不能为空", trigger: "blur" }
        ],
        endDateTime: [
          { required: true, message: "优惠券领取结束时间不能为空", trigger: "blur" }
        ],
        isPermanent: [
          { required: true, message: "是否无限张数不能为空", trigger: "blur" }
        ],
        status: [
          { required: true, message: "1 正常 0 未开启 -1 已无效不能为空", trigger: "blur" }
        ],
        isDel: [
          { required: true, message: "是否删除 0正常,2删除不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询已发布优惠卷列表 */
    getList() {
      this.loading = true;
      listCouponissue(this.queryParams).then(response => {
        this.couponissueList = response.rows;
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
        id: null,
        cname: null,
        cid: null,
        ctype: null,
        startDateTime: null,
        endDateTime: null,
        totalCount: null,
        remainCount: null,
        isPermanent: null,
        status: 0,
        isDel: null,
        createTime: null,
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加已发布优惠卷";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getCouponissue(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改已发布优惠卷";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCouponissue(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addCouponissue(this.form).then(response => {
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
      this.$confirm('是否确认删除已发布优惠卷编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delCouponissue(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('marketing/couponissue/export', {
        ...this.queryParams
      }, `marketing_couponissue.xlsx`)
    },

    //date转string
    formatTimeTwo(time) {
      if (time == null) return '无'
      // time = time * 1000
      const d = new Date(time)
      return (
        d.getFullYear() + '年' +
        (d.getMonth() + 1) +
        '月' +
        d.getDate() +
        '日' +
        d.getHours() +
        '时' +
        d.getMinutes() +
        '分'
      )
    }
  }
};
</script>
