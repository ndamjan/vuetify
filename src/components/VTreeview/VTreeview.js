import '../../stylus/components/_treeview.styl'

import VTreeview from './VTreeview'
import VCheckbox from '../VCheckbox'
import VBtn from '../VBtn'
import VIcon from '../VIcon'

import ExpandTransitionGenerator from '../transitions/expand-transition'

export default {
  name: 'v-treeview',

  inheritAttrs: false,

  data () {
    return {
    }
  },

  props: {
    captionField: {
      type: String,
      required: false,
      default: 'name'
    },
    checkbox: {
      type: Boolean,
      required: false,
      default: false
    },
    childrenField: {
      type: String,
      required: false,
      default: 'children'
    },
    expand: {
      type: Boolean,
      required: false,
      default: false
    },
    expandAll: {
      type: Boolean,
      required: false,
      default: false
    },
    expandedItems: {
      type: Array,
      required: false,
      default: () => []
    },
    iconField: {
      type: String,
      required: false,
      default: null
    },
    items: {
      type: Object,
      required: true,
      default: () => {}
    },
    level: {
      type: Number,
      required: false,
      default: 0
    },
    root: {
      type: Boolean,
      required: false,
      default: false
    },
    select: {
      type: Boolean,
      required: false,
      default: true
    },
    toolbar: {
      type: Boolean,
      required: false,
      default: false
    },
    value: {
      type: Array,
      required: false,
      default: () => []
    }
  },

  created () {
    if (!this.expandable || this.expandAll) {
      this.expandAllChildren()
    }
  },

  computed: {
    allDescendantLeafs () {
      let leafs = []
      let searchTree = items => {
        if (!!items[this.childrenField] && items[this.childrenField].length > 0) {
          items[this.childrenField].forEach(child => searchTree(child))
        } else {
          leafs.push(items)
        }
      }
      searchTree(this.items)
      return leafs
    },
    allDescendantLeafsSelected () {
      return this.hasChildren && this.hasSelection &&
        this.allDescendantLeafs.every(leaf => this.value.some(sel => sel === leaf))
    },
    allDescendantParents () {
      let parents = []
      let searchTree = items => {
        if (!!items[this.childrenField] && items[this.childrenField].length > 0) {
          parents.push(items)
          items[this.childrenField].forEach(child => searchTree(child))
        }
      }
      searchTree(this.items)
      return parents
    },
    caption () {
      return this.items[this.captionField]
    },
    children () {
      return this.hasChildren && this.items[this.childrenField]
    },
    expandable () {
      return this.expand || this.expandAll
    },
    hasChildren () {
      return !!this.items[this.childrenField] && this.items[this.childrenField].length > 0
    },
    hasSelection () {
      return !!this.value && this.value.length > 0
    },
    indeterminate () {
      return this.hasSelection && this.hasChildren &&
        this.someDescendantLeafsSelected && !this.allDescendantLeafsSelected
    },
    isExpanded () {
      return this.expandedItems.some(exp => exp === this.items)
    },
    leftPadding () {
      return (this.level * 24) + (this.expandable ? this.level * 24 : 0) -
        (this.expandable && this.level > 0 && this.hasChildren ? this.level * 24 + 4 : 0) -
        (this.expandable && this.level > 0 && !this.hasChildren ? this.level * 24 - 24 : 0) -
        (this.root ? 0 : 16)
    },
    someDescendantLeafsSelected () {
      return this.hasSelection &&
        this.allDescendantLeafs.some(leaf => this.value.some(sel => sel === leaf))
    },
    selected () {
      return this.select && this.hasSelection && this.value[this.value.length - 1] === this.items
    }

  },

  methods: {
    expandAllChildren () {
      this.expandedItems.push(...this.allDescendantParents)
    },
    genExpandButton () {
      if (this.hasChildren && this.expandable) {
        return this.$createElement(VBtn, {
          class: 'ma-0',
          props: {
            icon: true,
            small: true
          },
          on: {
            click: () => this.toggleExpandTree()
          }
        }, [this.genExpandIcon()])
      } else {
        return null
      }
    },
    genExpandIcon () {
      return this.$createElement(VIcon, {
        class: {
          expanded: this.isExpanded
        }
      }, ['keyboard_arrow_right'])
    },
    genCheckbox () {
      return this.$createElement(VCheckbox, {
        props: {
          hideDetails: true,
          // we set different behaviour if treeview has children or not
          inputValue: this.hasChildren ? this.allDescendantLeafsSelected : this.value,
          value: this.hasChildren ? this.allDescendantLeafsSelected : this.items,
          indeterminate: this.indeterminate
        },
        on: {
          change: selection => {
            // we set different behaviour if treeview has children or not
            if (this.hasChildren) {
              if (this.allDescendantLeafsSelected) {
                // deselect all
                this.allDescendantLeafs.forEach(leaf => {
                  let ix = this.value.indexOf(leaf)
                  this.value.splice(ix, 1)
                })
              } else {
                // select all
                this.allDescendantLeafs.forEach(leaf => {
                  let ix = this.value.indexOf(leaf)
                  if (ix === -1) {
                    this.value.push(leaf)
                  }
                })
              }
              this.$emit('input', this.value)
            } else {
              this.$emit('input', selection)
            }
          }
        }
      }, [
        this.$createElement('div', {
          slot: 'label'
        }, [this.genItemIcon(), this.caption])
      ])
    },
    genItemIcon () {
      if (this.iconField && this.items[this.iconField]) {
        return this.genIcon(this.items[this.iconField], 'mr-2')
      } else {
        return null
      }
    },
    genIcon (icon, classes, props) {
      return this.$createElement(VIcon, {
        class: classes,
        props: props
      }, [icon])
    },
    genRoot () {
      if (this.checkbox) {
        return this.$createElement('div', {
          style: {
            'padding-left': this.leftPadding + 'px'
          },
          class: {
            // 'selected': this.selected,
            'd-flex': true,
            'root': true
          }
        }, [
          this.genExpandButton(),
          this.genCheckbox(),
          this.genToolbar()
        ])
      } else {
        return this.$createElement('div', {
          style: {
            'padding-left': this.leftPadding + 'px'
          },
          class: {
            'accent': this.selected,
            'selected': this.selected,
            'd-flex': true,
            'root': true
          }
        }, [
          this.$createElement('div', {
            class: {
              'input-group': true,
              'checkbox': true,
              'input-group--hide-details': true,
              'input-group--selection-controls': true,
              'accent--text': true
            }
          }, [
            this.genExpandButton(),
            this.$createElement('label', {
              on: {
                click: () => this.toggleSelected()
              },
              class: 'treeview-label'
            }, [this.genItemIcon(), this.caption])
          ]),
          this.genToolbar()
        ])
      }
    },
    genToolbar () {
      if (!this.toolbar) {
        return null
      }
      return this.$createElement('div', {
        class: ['treeview-toolbar', 'd-flex']
      }, [
        this.$createElement(VBtn, {
          class: ['mx-1', 'my-0', 'secondary'],
          props: {
            small: true
          }
        }, [this.genIcon('drag_handle', undefined, {small: true})]),
        this.$createElement(VBtn, {
          class: ['mx-1', 'my-0', 'primary'],
          props: {
            small: true
          }
        }, [this.genIcon('edit', undefined, {small: true})]),
        this.$createElement(VBtn, {
          class: ['mx-1', 'my-0', 'success'],
          props: {
            small: true
          }
        }, [this.genIcon('add_circle', undefined, {small: true})]),
        this.$createElement(VBtn, {
          class: ['mx-1', 'my-0', 'error'],
          props: {
            small: true
          }
        }, [this.genIcon('delete', undefined, {small: true})])
      ])
    },
    genChild (child) {
      return this.$createElement(VTreeview, {
        on: {
          input: selection => {
            this.$emit('input', selection)
          }
        },
        props: {
          captionField: this.captionField,
          checkbox: this.checkbox,
          childrenField: this.childrenField,
          expand: this.expandable,
          expandedItems: this.expandedItems,
          iconField: this.iconField,
          items: child,
          level: this.level + 1,
          select: this.select,
          value: this.value
        }
      })
    },
    genChildren () {
      let children = []
      if (this.hasChildren) {
        if (this.isExpanded) {
          let childElements = []
          this.children.forEach(child => {
            childElements.push(this.genChild(child))
          })
          const expand = this.$createElement('div', {
            class: 'treeview-content',
            key: this.items[this.captionField] + this.level
          }, childElements)
          children.push(expand)
        }
        const transition = this.$createElement('transition-group', {
          props: {
            tag: 'div'
          },
          on: ExpandTransitionGenerator()
        }, children)
        return transition
      } else {
        return children
      }
    },
    toggleExpandTree () {
      let ix = this.expandedItems.findIndex(exp => exp === this.items)
      if (ix > -1) {
        this.expandedItems.splice(ix, 1)
      } else {
        this.expandedItems.push(this.items)
      }
    },
    toggleSelected () {
      if (this.select) {
        let ix = this.value.findIndex(val => val === this.items)
        this.value.splice(0, this.value.length)
        if (ix === -1) {
          this.value.push(this.items)
        }
        this.$emit('input', this.value)
      }
    }
  },

  render (createElement) {
    return createElement('div', {
      class: {
        treeview: true
      }
    }, [this.level === 0 && !this.root ? null : this.genRoot(), this.genChildren()])
  }
}
