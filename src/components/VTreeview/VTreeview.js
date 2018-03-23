import '../../stylus/components/_treeview.styl'

import VTreeview from './VTreeview'
import VCheckbox from '../VCheckbox'

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
    childrenField: {
      type: String,
      required: false,
      default: 'children'
    },
    items: {
      type: Object,
      required: true,
      default: () => {}
    },
    value: {
      type: Array,
      required: false,
      default: null
    }
  },

  computed: {
    allDescendantLeafs () {
      let leafs = []
      let searchTree = items => {
        if (items[this.childrenField] !== undefined && items[this.childrenField].length > 0) {
          items[this.childrenField].forEach(child => searchTree(child))
        } else {
          leafs.push(items)
        }
      }
      searchTree(this.items)
      return leafs
    },
    allDescendantLeafsSelected () {
      return this.hasChildren && this.hasSelection && this.allDescendantLeafs.every(leaf => this.value.some(sel => sel === leaf))
    },
    caption () {
      return this.items[this.captionField]
    },
    children () {
      return this.hasChildren && this.items[this.childrenField]
    },
    hasChildren () {
      return this.items[this.childrenField] !== undefined && this.items[this.childrenField].length > 0
    },
    hasSelection () {
      return this.value !== undefined && this.value.length > 0
    },
    indeterminate () {
      return this.hasSelection && this.hasChildren && this.someDescendantLeafsSelected
    },
    someDescendantLeafsSelected () {
      return this.hasSelection && this.allDescendantLeafs.some(leaf => this.value.some(sel => sel === leaf))
    }
  },

  methods: {
    genRoot () {
      if (this.value) {
        return this.$createElement(VCheckbox, {
          props: {
            label: this.caption,
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
        })
      } else {
        return this.$createElement('div', {
          class: [
            'input-group',
            'checkbox',
            'input-group--hide-details',
            'input-group--selection-controls',
            'accent--text'
          ]
        }, [
          this.$createElement('label', {
            class: 'treeview-label'
          }, [this.caption])
        ])
      }
    },
    genChild (child) {
      return this.$createElement(VTreeview, {
        class: 'ml-4',
        on: {
          input: selection => {
            this.$emit('input', selection)
          }
        },
        props: {
          captionField: this.captionField,
          childrenField: this.childrenField,
          items: child,
          value: this.value
        }
      })
    },
    genChildren () {
      let childElements = []
      if (this.hasChildren) {
        this.children.forEach(child => {
          childElements.push(this.genChild(child))
        })
      }
      return childElements
    }
  },

  render (createElement) {
    return createElement('div', {}, [this.genRoot(), ...this.genChildren()])
  }
}
