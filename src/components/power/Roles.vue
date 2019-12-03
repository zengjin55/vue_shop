<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色 -->
      <el-row>
        <el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
      </el-row>
      <!-- 列名 -->
      <el-table border stripe :data="rolelist" style="width: 100%;">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom','vcenter', index1 === 0 ? 'bdtop' : '']"
              v-for="(item1, index1) in scope.row.children" :key="item1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right" />
              </el-col>
              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row :class="['vcenter', index2 === 0 ? '' : 'bdtop']" v-for="(item2, index2) in item1.children"
                  :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right" />
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable
                      @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" />
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色描述" prop="roleDesc" />
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">修改
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除
            </el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSettingDialog(scope.row)">分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 对话框 -->
      <el-dialog title="分配权限" :visible.sync="settingDialogVisible" width="30%" @close="settingDialogClosed">
        <!-- 树形数据 -->
        <el-tree :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all
          :default-checked-keys="defkeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="settingDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 新增角色 -->
      <el-dialog title="新增角色" :visible.sync="addRoleDialogVisible" width="30%" @close="addRoleDialogClosed">
        <el-form ref="addRoleFormRef" :rules="addRoleRules" :model="addrole" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addrole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addrole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改角色 -->
      <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="30%">
        <el-form ref="editRoleFormRef" :rules="addRoleRules" :model="editRole" label-width="80px">
          <el-form-item label="角色ID">
            <el-input v-model="editRole.roleId" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRole.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRole.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleSave">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolelist: [],
      settingDialogVisible: false,
      rightList: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defkeys: [],
      roleId: '',
      addRoleDialogVisible: false,
      editRoleDialogVisible: false,
      addrole: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 40, message: '长度在 2 到 40 个字符', trigger: 'blur' }
        ]
      },
      editRole: {}
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色失败！')
      this.rolelist = res.data
    },
    async removeRightById (role, rightId) {
      const confirmResut = await this.$confirm('确认删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResut !== 'confirm') return
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败！')
      this.$message.success('删除权限成功！')
      // this.getRoleList() 如果重新请求的话会关上列表
      role.children = res.data
    },
    async showSettingDialog (role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限失败！')
      this.rightList = res.data
      this.getLeafKeys(role, this.defkeys)
      this.settingDialogVisible = true
    },
    getLeafKeys (node, arr) {
      // 判断是否是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 不是三级节点，递归
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    settingDialogClosed () {
      this.defkeys = []
    },
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('更新权限失败！')
      this.$message.success('更新权限成功！')
      this.getRoleList()
      this.settingDialogVisible = false
    },
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addrole)
        if (res.meta.status !== 201) return this.$message.error('新增角色失败！')
        this.$message.success('新增角色成功！')
        this.getRoleList()
        this.addRoleDialogVisible = false
      })
    },
    addRoleDialogClosed () {
      this.$refs.addRoleFormRef.resetFields()
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取角色失败！')
      this.editRole = res.data
      this.editRoleDialogVisible = true
    },
    editRoleDialogClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    async editRoleSave () {
      const { data: res } = await this.$http.put('roles/' + this.editRole.roleId, { roleName: this.editRole.roleName, roleDesc: this.editRole.roleDesc })
      if (res.meta.status !== 200) return this.$message.error('修改角色失败！')
      this.$message.success('修改角色成功')
      this.editRoleDialogVisible = false
      this.getRoleList()
    },
    async removeRoleById (id) {
      const confirmResult = await this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (!confirmResult === 'confirm') return
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除角色成功！')
      this.getRoleList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
