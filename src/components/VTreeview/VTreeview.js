import '../../stylus/components/_input-groups.styl'
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
    caption () {
      return this.items[this.captionField]
    }
  },

  methods: {
    genRoot () {
      if (this.value) {
        return this.$createElement(VCheckbox, {
          on: {
            change: selection => {
              this.$emit('input', selection)
            }
          },
          props: {
            label: this.caption,
            'hide-details': true,
            inputValue: this.value,
            value: this.items
          }
        }, [])
      } else {
        return this.$createElement('div', {
          class: ['input-group', 'checkbox', 'input-group--hide-details', 'input-group--selection-controls', 'accent--text']
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
      if (this.items[this.childrenField]) {
        this.items[this.childrenField].forEach(child => {
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
