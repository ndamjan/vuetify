import '../../stylus/components/_treeview.styl'

import VTreeview from './VTreeview'

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
      return this.$createElement('label', {
        class: 'treeview-label'
      }, [this.caption])
    },
    genChild (child) {
      return this.$createElement(VTreeview, {
        class: 'ml-4',
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
