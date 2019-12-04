<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon />
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader :options="GoodsCateList" :props="cateProps" v-model="selectedCateKeys" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加参数</el-button>
          <!-- 动态参数区域 -->
          <el-table border stripe :data="manyTableData">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染Tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                  @close="tagClosed(index, scope.row)">{{item}}</el-tag>
                <!-- 输入标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 新增标签 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" />
            <el-table-column prop="attr_name" label="参数名称" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParam(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddDialog">添加属性</el-button>
          <!-- 属性区域 -->
          <el-table border stripe :data="onlyTableData">
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染Tag标签 -->
                <el-tag v-for="(item, index) in scope.row.attr_vals" :key="index" closable
                  @close="tagClosed(index, scope.row)">{{item}}</el-tag>
                <!-- 输入标签 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 新增标签 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" />
            <el-table-column prop="attr_name" label="属性名称" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParam(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 新增参数对话框 -->
      <el-dialog :title="'增加'+dialogText" :visible.sync="addParamsDialogVisible" width="30%" @close="addDialogClosed">
        <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="90px">
          <el-form-item :label="dialogText" prop="attr_name">
            <el-input v-model="addParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改参数对话框 -->
      <el-dialog :title="'编辑'+dialogText" :visible.sync="editParamsDialogVisible" width="30%" @close="editDialogClosed">
        <el-form :model="editParamsForm" :rules="addParamsFormRules" ref="editParamsFormRef" label-width="90px">
          <el-form-item :label="dialogText" prop="attr_name">
            <el-input v-model="editParamsForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editParamsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveEditForm">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      GoodsCateList: [],
      // 级联选择框配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 储存所选择到的数据
      selectedCateKeys: [],
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addParamsDialogVisible: false,
      editParamsDialogVisible: false,
      addParamsForm: {
        attr_name: ''
      },
      editParamsForm: {
      },
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.GoodsCateList = res.data
    },
    handleChange () {
      this.getParamData()
    },
    // 点击页签
    handleClick () {
      this.getParamData()
    },
    async getParamData () {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本显示 与 文本内的值
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 显示增加参数弹框
    showAddDialog () {
      this.addParamsDialogVisible = true
    },
    addDialogClosed () {
      this.$refs.addParamsFormRef.resetFields()
    },
    addParams () {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功！')
        this.addParamsDialogVisible = false
        this.getParamData()
      })
    },
    async showEditDialog (attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数失败！')
      this.editParamsForm = res.data
      this.editParamsDialogVisible = true
    },
    saveEditForm () {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, {
          attr_name: this.editParamsForm.attr_name, attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
        this.$message.success('修改参数成功！')
        this.getParamData()
        this.editParamsDialogVisible = false
      })
    },
    editDialogClosed () {
      this.$refs.editParamsFormRef.resetFields()
    },
    async removeParam (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') return
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')
      this.getParamData()
    },
    showInput (row) {
      row.inputVisible = true
      // 获取input输入框焦点
      // $nextTick 当页面上的元素重新被渲染时，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async saveTage (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改标签失败！')
      this.$message.success('修改标签成功！')
    },
    async handleInputConfirm (row) {
      // 用户未输入或输入为空格，不保存，清空输入
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 用户输入了标签文字
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveTage(row)
    },
    tagClosed (index, row) {
      row.attr_vals.splice(index, 1)
      this.saveTage(row)
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) return true
      return false
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
      return null
    },
    dialogText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
