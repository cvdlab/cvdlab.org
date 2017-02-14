const _templates = {}
const _resolve = {}

class TemplateElement extends HTMLElement {

  static get _templates () {
    return _templates
  }

  static _register_template (name) {
    if (!_templates[name]) {
      _templates[name] = new Promise((resolve, reject) => {
        _resolve[name] = resolve
      })
    }
  }

  static get_template (name) {
    this._register_template(name)
    return _templates[name]
  }

  static set_template (name, template) {
    this._register_template(name)
    _resolve[name](template)
  }

  connectedCallback() {
    this._register()
  }

  _register () {
    if (this._registered) {
      return
    }
    let name = this.id
    let template = this.querySelector('template')

    if (window.ShadyCSS) {
      ShadyCSS.prepareTemplate(template, name)
    }

    this.constructor.set_template(name, template)
    this._registered = true

    if (this.hasAttribute('selfy')) {
      this._define()
    }
  }

  _define () {
    customElements.define(this.id, class extends Pantarei.Element {})
  }

}

customElements.define('template-element', TemplateElement)

class Element extends HTMLElement {

  static get template () {
    return TemplateElement.get_template(this.is)
  }

  static get props () {
    return {
      data: {
        type: 'Object',
        value: {}
      }
    }
  }

  constructor () {
    super()
    this._parse_node = this._parse_node.bind(this)
    this._render_node = this._render_node.bind(this)
    this._on_event = this._on_event.bind(this)
    this.render = this.render.bind(this)
    this._debounced_render = this.debounce(this.render, 16)
    this._listeners = {}
    this._init_props()
    this._init_content()
  }

  connectedCallback () {
    ShadyCSS.applyStyle(this)
  }

  disconnectedCallback () {

  }

  _init_props () {
    this._props = {}
    let props = this.constructor.props
    Object.keys(props).forEach((name) => {
      let descriptor = props[name]
      this._init_prop(name, descriptor)
    })
  }

  _init_prop (name, descriptor) {
    let value = descriptor.value
    if (typeof value === 'function') {
      value = value()
    }
    this._props[name] = value || this[name]

    Object.defineProperty(this, name, {
      get: () => {
        return this._props[name]
      },
      set: (value) => {
        if (this._props[name] === value) {
          return
        }
        this._props[name] = value
        this._debounced_render()
      }
    })
  }

  _init_content () {
    let name = this.localName
    this.attachShadow({ mode: 'open' })
    this.constructor.template.then((template) => {
      let content = template.content
      let node = document.importNode(content, true)
      this.shadowRoot.appendChild(node)
      this._init_refs()
      this._parse(this.shadowRoot)
      this.ready()
      this.render()
    }).catch((err) => {
      console.warn(err)
    })
  }

  _init_refs () {
    this.refs = {}
    let nodes = this.shadowRoot.querySelectorAll('[id]')
    Array.from(nodes).forEach((node) => {
      this.refs[node.id] = node
    })
  }

  _parse (node) {
    this._traverse(node, this._parse_node)
  }

  _traverse (element, handler) {
    let pass = handler(element)
    if (!pass) {
      return
    }
    let child = element.firstElementChild
    while (child) {
      this._traverse(child, handler)
      child = child.nextElementSibling
    }
  }

  _parse_node (node) {
    if (node.nodeType !== node.ELEMENT_NODE) {
      return true
    }
    node._dirs = []
    this._parse_node_attributes(node)
    this._parse_node_text(node)
    return true
  }

  _parse_node_attributes (node) {
    let attributes = Array.from(node.attributes)
    attributes.forEach((attribute) => {
      this._parse_node_attribute(node, attribute)
    })
  }

  _parse_node_attribute (node, attribute) {
    let name = attribute.name
    let value = attribute.value || ''

    if (this._is_expression(value)) {
      let path = this._extract_value(value)
      let getter = this._generate_getter(path)
      let directive = function (data) {
        this[name] = getter(data)
      }
      node._dirs.push(directive)
    }

    if (this._is_event_name(name)) {
      let event_name = this._parse_event_name(name)
      if (!this._listeners[event_name]) {
        this._listeners[event_name] = true
        this.shadowRoot.addEventListener(event_name, this._on_event, false)
      }
    }
  }

  _parse_node_text (node) {
    let child = node.firstChild
    while (child) {
      if (child.nodeType === child.TEXT_NODE) {
        let text = child.nodeValue || ''
        if (this._is_expression(text)) {
          let path = this._extract_value(text)
          let getter = this._generate_getter(path)
          let name = node._dirs
          let placeholder = document.createElement('x-text')
          placeholder.setAttribute('text', text)
          let directive = function (data) {
            this.text = getter(data)
          }
          placeholder._dirs = []
          placeholder._dirs.push(directive)
          node.insertBefore(placeholder, child)
          child.remove()
        }
      }
      child = child.nextSibling
    }
  }

  static get EXPRESSION_BEGIN () { return '{{' }

  static get EXPRESSION_END () { return '}}' }

  static get ATTRIBUTE_EVENT_PREFIX () { return 'on-' }

  _is_expression (text) {
    let start = text.startsWith(this.constructor.EXPRESSION_BEGIN)
    let end = text.endsWith(this.constructor.EXPRESSION_END)
    let test = start && end
    return test
  }

  _is_event_name (string) {
    return string.startsWith(this.constructor.ATTRIBUTE_EVENT_PREFIX)
  }

  _parse_event_name (string) {
    return string.slice(this.constructor.ATTRIBUTE_EVENT_PREFIX.length)
  }

  _extract_value (expression) {
    let length = expression.length
    let first_char = this.constructor.EXPRESSION_BEGIN.length
    let last_char = length - this.constructor.EXPRESSION_END.length
    let value = expression.substring(first_char, last_char)
    return value
  }

  _generate_getter (path) {
    let parts = path.split('.')
    let n = parts.length

    if (n == 1) {
      return function (value) {
        return value[path]
      }
    }

    return function (value) {
      for (let i = 0; i < n && value; i++) {
        let part = parts[i]
        value = value[part]
      }
      return value
    }
  }

  ready () {}

  render () {
    this._traverse(this.shadowRoot, this._render_node)
  }

  _render (node, data) {
    this._traverse(node, (node) => {
      return this._render_node(node, data)
    })
  }

  _render_node (node, data) {
    if (node !== this.shadowRoot) {
      if (node.nodeType !== node.ELEMENT_NODE) {
        return false
      }
    }
    data = data || this
    let _dirs = node._dirs || []
    _dirs.forEach((directive) => {
      directive.call(node, data)
    })
    return true
  }

  static get EVENT_PREFIX () {
    return 'on-'
  }

  _on_event (event) {
    let root = this.shadowRoot
    let target = event.target

    let event_type = event.type
    let event_attr = this.constructor.EVENT_PREFIX + event_type

    let bubble = true
    let stop = event.stopPropagation

    event.stopPropagation = function () {
      stop.call(event)
      bubble = false
    }

    while (bubble) {
      let listener_name = target.getAttribute(event_attr)
      if (listener_name) {
        let listener = this[listener_name]
        if (listener) {
          listener.call(this, event, event.detail)
        }
      }

      if (!bubble) {
        break
      }

      target = target.parentNode
      if (!target) {
        break
      }
      if (target === root) {
        break
      }
    }
  }

  fire (type, detail) {
    let config = { bubbles: true, cancelable: true, detail: detail }
    let event = new CustomEvent(type, config)
    this.dispatchEvent(event)
    return this
  }

  action (name, data) {
    this.fire('action', { name: name, data: data })
    return this
  }

  async (func) {
    requestAnimationFrame(func.bind(this))
  }

  debounce (func, wait) {
    wait = wait || 0

    let waiting = false
    let self = this

    function invoked () {
      waiting = false
      func.call(self)
    }

    function debounced () {
      if (waiting) {
        return
      }
      waiting = true
      setTimeout(invoked, wait)
    }

    return debounced
  }

}

class TemplateToggle extends HTMLElement {

  connectedCallback () {
    this._setup()
  }

  _setup () {
    let template = this.querySelector('template')
    this._template = document.importNode(template, true)

    let stage = document.createDocumentFragment()
    let content = this._template.content
    let node = content.children[0]

    stage.appendChild(node)
    this._node = node.cloneNode(true)
    content.appendChild(node)

    this._clone = null;
    this.style.display = 'none'
  }

  _create_clone () {
    let clone = this._node.cloneNode(true)
    this._container.parse_node(clone)
    this.parentNode.insertBefore(clone, this)
    this._clone = clone
  }

  _render_clone () {

  }

  _remove_clone () {
    this._clone.remove();
    this._clone = null
  }

  render () {
    let old_test = this._test
    let new_test = this.test

    if (new_test) {
      if (old_test) {
        this._render_clone()
      } else {
        this._create_clone()
        this._render_clone()
      }
    } else {
      if (old_test) {
        this._remove_clone()
      }
    }
  }

}

customElements.define('x-toggle', TemplateToggle)

class TemplateRepeat extends HTMLElement {

  constructor () {
    super()
    this.render = this.render.bind(this)
    this._debounced_render = this.debounce(this.render, 16)
    this._init_props()
  }

  _init_props () {
    this._props = {}
    this._init_prop('items')

    this.items = []
    this._items = []
    this._nodes = []
  }

  _init_prop (prop) {
    Object.defineProperty(this, prop, {
      get: () => {
        return this._props[prop]
      },
      set: (value) => {
        // if (this._props[prop] === value) {
        //   return
        // }
        this._props[prop] = value
        this._debounced_render()
      }
    })
  }

  connectedCallback () {
    // requestAnimationFrame(() => {
      this._setup()
    // })
  }

  _setup () {
    this.style.display = 'none'

    this._root = this.getRootNode()
    this._host = this._root.host

    this._item_name = this.getAttribute('item') || 'item'
    this._index_name = this.getAttribute('index') || 'index'


    let template = this.querySelector('template')
    this._template = template

    let content = template.content
    let node = content.children[0]
    let stage = document.createDocumentFragment()
    stage.appendChild(node)
    this._node = node.cloneNode(true)
    content.appendChild(node)
  }

  _create_clone (index) {
    let clone = this._node.cloneNode(true)
    this._nodes[index] = clone
    this._host._parse(clone)
    return clone
  }

  _render_clone (index, data) {
    let clone = this._nodes[index]
    let clone_data = Object.assign({}, data)
    let item = this.items[index]
    clone_data[this._item_name] = item
    clone_data[this._index_name] = index
    this._host._render(clone, clone_data)
    let detail = { index: index, data: clone_data, node: clone }
    let config = { bubbles: true, cancelable: true, detail: detail }
    let event = new CustomEvent('render', config)
    this.dispatchEvent(event)
  }

  _remove_clone (index) {
    let clone = this._nodes[index]
    clone.remove()
    this._nodes[index] = null
  }

  render (data) {
    let old_items = this._items || []
    let new_items = this.items || []

    if (!Array.isArray(new_items)) {
      new_items = []
    }

    let old_items_count = old_items.length
    let new_items_count = new_items.length

    if (new_items_count < old_items_count) {
      for (let index = 0; index < new_items_count; index++) {
        this._render_clone(index, data)
      }
      for (let index = new_items_count; index < old_items_count; index++) {
        this._remove_clone(index)
      }
    }
    else {
      for (let index = 0; index < old_items_count; index++) {
        this._render_clone(index, data)
      }
      let fragment = document.createDocumentFragment()
      for (let index = old_items_count; index < new_items_count; index++) {
        let clone = this._create_clone(index)
        fragment.appendChild(clone)
        this._render_clone(index, data)
      }
      this.parentNode.insertBefore(fragment, this)
    }

    this._items = new_items.slice()
  }

  debounce (func, wait) {
    wait = wait || 0

    let waiting = false
    let self = this

    function invoked () {
      waiting = false
      func.call(self)
    }

    function debounced () {
      if (waiting) {
        return
      }
      waiting = true
      setTimeout(invoked, wait)
    }

    return debounced
  }

}

customElements.define('x-repeat', TemplateRepeat)

class TemplateText extends HTMLElement {

  constructor () {
    super()
    this._init_props()
    this._init_content()
  }

  _init_props () {
    this._props = {}
    this._props['text'] = ''
    Object.defineProperty(this, 'text', {
      get: () => {
        return this._props[name]
      },
      set: (value) => {
        if (this._props[name] === value) {
          return
        }
        this._props[name] = value
        requestAnimationFrame(() => {
          this.render()
        })
      }
    })
  }

  _init_content () {
    this._node = document.createTextNode('')
  }

  connectedCallback () {
    this._setup()
  }

  _setup () {
    this.style.display = 'none'
    this.parentNode.insertBefore(this._node, this)
  }

  render () {
    this._node.textContent = this.text
  }

}

customElements.define('x-text', TemplateText)

class TemplateStyle extends HTMLElement {

  connectedCallback () {
    this._setup()
  }

  _setup () {
    let href = this.getAttribute('href')
    let root = this.getRootNode()
    let host = root.host
    let name = host.localName

    fetch(href)
      .then((response) => {
        return response.text()
      })
      .then((text) => {
        let stylenode = document.createElement('style')
        stylenode.textContent = text

        if (window.ShadyCSS) {
          let template = document.createElement('template')
          template.content.appendChild(stylenode)
          ShadyCSS.prepareTemplate(template, name)
          ShadyCSS.applyStyle(host, root)
        }
      })
      .catch((err) => {
        console.warn(err)
      })
  }

}

customElements.define('x-style', TemplateStyle)

window['Pantarei'] = {
  Element,
  TemplateElement,
  TemplateToggle,
  TemplateRepeat,
  TemplateText,
  TemplateStyle
}