var Pantarei

(function () {

  const TAG_TEMPLATE = 'TEMPLATE'

  function setup_node (node, root, listeners) {
    root = root || node
    listeners = listeners || root

    root.listeners = listeners

    setup_node_event(node, root, listeners)
    parse_node(node, root)
  }

  function parse_node (node, root) {
    if (node.nodeType === node.TEXT_NODE) {
      parse_node_text(node, root)
      return
    }
    if (node.nodeType === node.DOCUMENT_FRAGMENT_NODE) {
      parse_node_fragment(node, root)
      return
    }
    if (node.nodeType !== node.ELEMENT_NODE) {
      return
    }
    if (node.nodeName.toUpperCase() === TAG_TEMPLATE) {
      parse_node_template(node, root)
      return
    }
    parse_node_element(node, root)
  }

  function parse_node_fragment (node, root) {
    node.pantarei = {}
    node.pantarei.root = root

    let child = node.firstChild;
    while (child) {
      parse_node(child, root);
      child = child.nextSibling;
    }
  }

  function parse_node_element (node, root) {
    node.pantarei = {}
    node.pantarei.directives = []
    node.pantarei.root = root

    parse_attributes(node, node.attributes)

    let child = node.firstChild;
    while (child) {
      parse_node(child, root);
      child = child.nextSibling;
    }
  }

  function parse_attributes (node, attributes) {
    for (let i = 0, n = attributes.length; i < n; i++) {
      let attribute = attributes[i]
      parse_attribute(node, attribute)
    }
  }

  function parse_attribute (node, attribute) {
    let name = attribute.name
    let value = attribute.value

    if (is_expression(value)) {
      let getter = parse_expression(value)
      let handler = function (data) {
        this[name] = getter(data)
      }
      let directive = {
        type: 'attribute',
        name: attribute.name,
        value: attribute.value,
        handler: handler
      }
      node.pantarei.directives.push(directive)
      return
    }

    if (is_event(name)) {
      let root = node.pantarei.root
      let event_name = parse_event(name)
      if (!root.listeners.hasOwnProperty(event_name)) {
        root.listeners[event_name] = true
        root.addEventListener(event_name, root.listener, false)
      }
    }

    return null
  }

  var OPEN_EXPRESSION = '{{'
  var CLOSE_EXPRESSION = '}}'

  function is_expression (string) {
    return string.startsWith(OPEN_EXPRESSION) && string.endsWith(CLOSE_EXPRESSION)
  }

  function parse_expression (string) {
    var length = string.length
    var first_char = OPEN_EXPRESSION.length
    var last_char = length - CLOSE_EXPRESSION.length
    var path = string.substring(first_char, last_char)

    var parts = path.split('.')
    var n = parts.length

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

  var PREFIX_EVENT = 'on-'

  function is_event (string) {
    return string.startsWith(PREFIX_EVENT)
  }

  function parse_event (string) {
    return string.slice(PREFIX_EVENT.length)
  }

  function parse_node_text (node, root) {
    let content = node.textContent.trim()
    if (content === '') {
      return
    }
    if (is_expression(content)) {
      let getter = parse_expression(content)
      let template = document.createElement('template')
      node.parentNode.insertBefore(template, node)
      template.setAttribute('is', 'text')
      template.setAttribute('content', content)
      template.pantarei = {}
      let handler = function (data) {
        node.textContent = getter(data)
      }
      template.pantarei.directive = {
        type: 'text',
        content: content,
        handler: handler
      }
    }
  }

  function parse_node_template (template, root) {
    let is = template.getAttribute('is')

    if (is === 'if') {
      parse_node_template_if(template, root)
      return
    }
    if (is === 'repeat') {
      parse_node_template_repeat(template, root)
      return
    }
  }

  var stage = document.createDocumentFragment()

  function parse_node_template_if (template, root) {
    template.pantarei = {}
    template.pantarei.root = root

    let content = template.content
    let node = content.children[0]
    stage.appendChild(node);
    template.pantarei.node = node.cloneNode(true)
    content.appendChild(node);

    template.pantarei.test_path = template.getAttribute('if')
    template.pantarei.test_func = parse_expression(template.pantarei.test_path)
    template.pantarei.clone = null;
  }

  function parse_node_template_repeat (template, root) {
    template.pantarei = {}
    template.pantarei.root = root

    let content = template.content
    let node = content.children[0]
    stage.appendChild(node)
    template.pantarei.node = node.cloneNode(true)
    content.appendChild(node)

    template.pantarei.item_name = template.getAttribute('item') || 'item'
    template.pantarei.index_name = template.getAttribute('index') || 'index'
    template.pantarei.items_path = template.getAttribute('items')
    template.pantarei.items_func = parse_expression(template.pantarei.items_path)
    template.pantarei.items = []
    template.pantarei.clones = []
  }

  function setup_node_event (node, root, listeners) {

    function listener (event) {
      var event_type = event.type
      var event_name = PREFIX_EVENT + event_type
      var target = event.target

      var bubble = true
      var stopPropagation = event.stopPropagation
      event.stopPropagation = function () {
        stopPropagation.call(event)
        bubble = false
      }

      while (bubble) {
        if (target === root) {
          bubble = false
        }

        let listener_name = target.getAttribute(event_name)
        if (listener_name) {
          let listener = listeners[listener_name]
          listener.call(listeners, event, event.detail)
        }

        if (!bubble) {
          break
        }
        target = target.parentNode
        if (!target) {
          break
        }
        if (target.nodeType === target.DOCUMENT_FRAGMENT_NODE) {
          break
        }
      }
    }

    root.listener = listener
  }

  function render_node (node, data) {
    if (node.nodeType === node.DOCUMENT_FRAGMENT_NODE) {
      render_node_fragment(node, data)
      return
    }
    if (node.nodeType !== node.ELEMENT_NODE) {
      return
    }
    if (node.nodeName.toUpperCase() === TAG_TEMPLATE) {
      render_node_template(node, data)
      return
    }
    render_node_element(node, data)
  }

  function render_node_fragment (node, data) {
    let child = node.firstElementChild;
    while (child) {
      render_node(child, data);
      child = child.nextElementSibling;
    }
  }

  function render_node_element (node, data) {
    let pantarei = node.pantarei
    if (!pantarei) {
      return
    }

    let directives = pantarei.directives
    if (!directives) {
      return
    }

    for (let i = 0, n = directives.length; i < n; i++) {
      let directive = directives[i]
      directive.handler.call(node, data)
    }

    let child = node.firstElementChild;
    while (child) {
      render_node(child, data);
      child = child.nextElementSibling;
    }

    if (node.update) {
      node.update()
    }
  }

  function render_node_template (template, data) {
    let is = template.getAttribute('is')

    if (is === 'text') {
      render_node_template_text(template, data)
      return
    }
    if (is === 'if') {
      render_node_template_if(template, data)
      return
    }
    if (is === 'repeat') {
      render_node_template_repeat(template, data)
      return
    }
  }

  function render_node_template_text (node, data) {
    let pantarei = node.pantarei
    let directive = pantarei.directive
    let handler = directive.handler
    handler(data)
  }

  function render_node_template_if (template, data) {

    function create_clone () {
      let root = template.pantarei.root
      let node = template.pantarei.node
      let clone = node.cloneNode(true)
      parse_node(clone, root)
      template.parentNode.insertBefore(clone, template);
      template.pantarei.clone = clone
    }

    function render_clone () {
      render_node(template.pantarei.clone, data)
    }

    function remove_clone () {
      template.pantarei.clone.remove();
      template.pantarei.clone = null
    }

    let old_test = template.pantarei.test
    let new_test = template.pantarei.test_func(data);
    template.pantarei.test = new_test

    if (new_test) {
      if (old_test) {
        render_clone()
      } else {
        create_clone()
        render_clone()
      }
    } else {
      if (old_test) {
        remove_clone()
      }
    }

  }

  function render_node_template_repeat (template, data) {

    function create_clone (index) {
      let root = template.pantarei.root
      let node = template.pantarei.node
      let clone = node.cloneNode(true)
      parse_node(clone, root)
      template.parentNode.insertBefore(clone, template)
      template.pantarei.clones[index] = clone
    }

    function render_clone (index) {
      let clone = template.pantarei.clones[index]
      let clone_data = Object.assign({}, data)
      let item = template.pantarei.items[index]
      clone_data[template.pantarei.item_name] = item
      clone_data[template.pantarei.index_name] = index
      render_node(clone, clone_data)
    }

    function remove_clone (index) {
      let clone = template.pantarei.clones[index]
      clone.remove()
      template.pantarei.clones[index] = null
    }

    let old_items = template.pantarei.items
    let new_items = template.pantarei.items_func(data)

    if (!Array.isArray(new_items)) {
      new_items = []
    }

    template.pantarei.items = new_items.slice()

    let old_items_count = old_items.length
    let new_items_count = new_items.length

    if (new_items_count < old_items_count) {
      for (let index = 0; index < new_items_count; index++) {
        render_clone(index)
      }
      for (let index = new_items_count; index < old_items_count; index++) {
        remove_clone(index)
      }
    }
    else {
      for (let index = 0; index < old_items_count; index++) {
        render_clone(index)
      }
      for (let index = old_items_count; index < new_items_count; index++) {
        create_clone(index)
        render_clone(index)
      }
    }
  }

  class PantareiElement extends HTMLElement {

    constructor () {
      super()
      this.before_create()
    }

    get mode () { return 'open' }

    get props () { return {} }

    setup () {
      this.before_setup()
      Pantarei.setup(this.shadowRoot, this.shadowRoot, this)
      this.after_setup()
    }

    set_props (props) {
      for (let name in props) {
        let prop = props[name]
        let value = prop.value
        if (this.hasAttribute(name)) {
          value = this.getAttribute(name)
        }
        if (value !== undefined) {
          this[name] = value
        }
      }
    }

    _init_refs () {
      let refs = {}
      let nodes = this.shadowRoot.querySelectorAll('[ref]')
      for (let i = 0, n = nodes.length; i < n; i++) {
        let node = nodes[i]
        let ref = node.getAttribute('ref')
        node.ref = ref
        refs[ref] = node
      }
      this.refs = refs
    }

    update () {
      let pass = this.should_update()
      if (!pass) {
        return
      }
      this.before_update()
      Pantarei.update(this.shadowRoot, this)
      this.after_update()
    }

    fire (type, detail) {
      let event = new CustomEvent(type, { bubbles: true, cancelable: true, detail: detail })
      requestAnimationFrame(() => { this.dispatchEvent(event) })
      return event
    }

    action (name, data) {
      this.fire('action', { name: name, data: data })
      return this
    }

    async (f) {
      requestAnimationFrame(f.bind(this))
    }

    connectedCallback () {
      console.log(this)
    }

    createdCallback () {
      this.createShadowRoot()

      let name = this.localName
      let template = Pantarei.templates[name]
      let content = template.content

      let node = document.importNode(content, true)
      this.shadowRoot.appendChild(node)

      this.set_props(this.props)
      this.setup()
      this._init_refs()
      this.after_create()

      ShadyCSS.applyStyle(this, this.shadowRoot)
    }

    attachedCallback () {
      this.before_connect()
      Pantarei.update(this.shadowRoot, this)
      this.after_connect()
    }

    disconnectedCallback () {
      this.after_disconnect()
    }

    attributeChangedCallback () {}

    before_create () {}

    after_create () {}

    should_update () { return true }

    before_update () {}

    after_update () {}

    before_connect () {}

    after_connect () {}

    after_disconnect () {}

    before_setup () {}

    after_setup () {}

  }

  class TemplateElement extends HTMLElement {

    createdCallback () {
      let name = this.id
      let template = this.querySelector('template')
      template = document.importNode(template, true)
      Pantarei.templates[name] = template
      ShadyCSS.prepareTemplate(template, name)
      console.log('created', name)
    }

  }

  document.registerElement('template-element', TemplateElement)

  class TemplateRepeat extends HTMLElement {

  }

  document.registerElement('template-repeat', TemplateRepeat)

  class TemplateIf extends HTMLElement {

  }

  document.registerElement('template-if', TemplateIf)

  Pantarei = {}

  Pantarei.templates = {}

  Pantarei.setup = setup_node

  Pantarei.update = render_node

  Pantarei.Element = PantareiElement

}())