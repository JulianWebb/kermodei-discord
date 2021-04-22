class PermissionLevel {
    constructor(value, parent) {
        this.value = value;
        this.parent = parent;
    }
}

class PermissionManager {
    constructor(permissionTree, roleList) {
        this.nodes = {};
        this.enum = {};
        if (Object.keys(permissionTree).length != 1) {
            throw("Top of Permission Tree must be single entry");
        }
        let rootValue = Object.keys(permissionTree)[0];
        this.root = this.addNode(rootValue, permissionTree[rootValue]);
        
        this.roleList = roleList
    }

    addNode(leafValue, leafDesendants, leafParent) {
        let leaf = new PermissionLevel(leafValue, leafParent);
        this.nodes[leafValue] = leaf;
        this.enum[leafValue] = leafValue;
        Object.entries(leafDesendants).forEach(child => {
            this.addNode(child[0], child[1], leaf)
        })

        return leaf;
    }

    isAboveOrEqual(checkPermission, againstPermission) {
        if (checkPermission == againstPermission) return true;
        let parentPermission = this.nodes[againstPermission].parent?.value;
        if (parentPermission == undefined) return false;
        return this.isAboveOrEqual(checkPermission, parentPermission);
    }

    roleHasPermission(roleId, requiredPermission) {
        if (this.enum[requiredPermission] == undefined) throw ("Invalid Permission");
        if (!Object.keys(this.roleList).includes(roleId)) return false;
        return this.roleList[roleId].some(permission => {
            return this.isAboveOrEqual(permission, requiredPermission);
        })
    }

}

module.exports = PermissionManager;