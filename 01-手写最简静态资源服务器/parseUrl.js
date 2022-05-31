/**
 * @author Yedi Zhang --Tust
 * @date 2022/5/31 23:33
 * @email 178320369@qq.com
 */


// 实现一个前缀树匹配Url


// a b c
// c a d
// search : a b d
// if (!node[str]) return faslse
// if (node[str]) node = node[str]
/**
 TreeNode(
 children:{
            a : {
                 b:  {
                     c : {
                     }
                 }
            },
            c : {
                a : {
                    d: {

                    }
                }
            }
        }
 )
 */
var Trie = function() {
    this.children = {};
};

Trie.prototype.insert = function(word) {
    let node = this.children;
    for (const ch of word) {
        if (!node[ch]) {
            node[ch] = {};
        }
        node = node[ch];
    }
    node.isEnd = true;
};

Trie.prototype.searchPrefix = function(prefix) {
    let node = this.children;
    for (const ch of prefix) {
        if (!node[ch]) {
            return false;
        }
        node = node[ch];
    }
    return node;
}

Trie.prototype.search = function(word) {
    const node = this.searchPrefix(word);
    return node !== undefined && node.isEnd !== undefined;
};

Trie.prototype.startsWith = function(prefix) {
    return this.searchPrefix(prefix);
};


let trie = new Trie();
trie.insert("/user")
console.log(trie.children)
console.log(trie.search("/user/a"));
console.log(trie.startsWith("/us"));


