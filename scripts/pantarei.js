var Pantarei

(function () {

  Pantarei = {}

  Pantarei.templates = {}

  Pantarei.context = {}

  class PantareiElement extends HTMLElement {

    get ATTRIBUTE_EVENT_PREFIX () { return 'on-' }

    get EXPRESSION_BEGIN () { return '{{' }

    get EXPRESSION_END () { return '}}' }

    get props () { return {} }

    setup () {
      this._parse()
    }

    _listener (event) {
      let root = this.shadowRoot
      let target = event.target

      let event_type = event.type
      let event_attr = this.ATTRIBUTE_EVENT_PREFIX + event_type

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
          listener.call(this, event, event.detail)
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

    _is_expression (text) {
      return text.startsWith(this.EXPRESSION_BEGIN) && text.endsWith(this.EXPRESSION_END)
    }

    _is_event (string) {
      return string.startsWith(this.ATTRIBUTE_EVENT_PREFIX)
    }

    _parse_event (string) {
      return string.slice(this.ATTRIBUTE_EVENT_PREFIX.length)
    }

    _parse () {
      this._listeners = {}

      let root = this.shadowRoot
      let child = root.firstChild
      while (child) {
        this._parse_node(child)
        child = child.nextSibling
      }
    }

    _parse_node (node) {
      node._container = this

      let type = node.nodeType
      if (type === node.TEXT_NODE) {
        this._parse_node_text(node)
        return
      }
      if (type === node.DOCUMENT_FRAGMENT_NODE) {
        this._parse_node_fragment(node)
        return
      }
      if (type === node.ELEMENT_NODE) {
        this._parse_node_element(node)
        return
      }
    }

    _parse_node_text (node) {
      let text = node.textContent.trim()
      if (text === '') {
        return
      }
      if (this._is_expression(text)) {
        let template = document.createElement('template-text')
        template._container = this
        template.setAttribute('text', text)
        this._parse_node(template)
        node.parentNode.insertBefore(template, node)
        node.remove()
      }
    }

    _parse_node_fragment (node) {
      let child = node.firstChild
      while (child) {
        this._parse_node(child)
        child = child.nextSibling
      }
    }

    _parse_node_element (node) {
      node._directives = {}

      this._parse_node_attributes(node)

      let child = node.firstChild;
      while (child) {
        this._parse_node(child);
        child = child.nextSibling;
      }
    }

    _parse_node_attributes (node) {
      let attributes = node.attributes
      let n = attributes.length

      for (let i = 0; i < n; i++) {
        let attribute = attributes[i]

        let name = attribute.name
        let value = attribute.value

        if (this._is_expression(value)) {
          let getter = this._parse_expression(value)
          let directive = function (data) {
            this[name] = getter(data)
          }
          node._directives[name] = directive
          continue
        }

        if (this._is_event(name)) {
          let event_name = this._parse_event(name)
          if (!this._listeners[event_name]) {
            this._listeners[event_name] = true
            this.shadowRoot.addEventListener(event_name, this._listener, false)
          }
        }
      }
    }

    _parse_expression (expression) {
      let length = expression.length
      let first_char = this.EXPRESSION_BEGIN.length
      let last_char = length - this.EXPRESSION_END.length
      let path = expression.substring(first_char, last_char)

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

    render (data) {
      this._render_node_children(this.shadowRoot, data)
    }

    _render_node_children (node, data) {
      let child = node.firstElementChild
      while (child) {
        this._render_node(child, data)
        child = child.nextElementSibling
      }
    }

    _render_node (node, data) {
      data = data || this

      if (node.nodeType !== node.ELEMENT_NODE) {
        return
      }


      let directives = node._directives
      if (directives) {
        for (let name in directives) {
          let directive = directives[name]
          directive.call(node, data)
        }
      }

      this._render_node_children(node, data)

      if (node.render) {
        node.context = Object.assign(node.context || {}, this.context)
        node.render()
        // node.render(data)
      }
    }

    _cache_refs () {
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

    should_update () {
      return true
    }

    before_update () {}

    update () {
      let pass = this.should_update()
      if (!pass) {
        return
      }
      this.before_update()
      this.render()
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

    async (f) {
      requestAnimationFrame(f.bind(this))
    }

    createdCallback () {
      this._listener = this._listener.bind(this)

      this.createShadowRoot()

      let name = this.localName
      let template = Pantarei.templates[name]
      let content = template.content

      let node = document.importNode(content, true)
      this.shadowRoot.appendChild(node)

      this.set_props(this.props)

      // this.context = Pantarei.context

      this.setup()
      this._cache_refs()
      this.after_create()

    }


    attachedCallback () {
      this._prepare_style()
      this.update()
      this.after_connect()
    }

    _prepare_style () {
      let stylesheets = this.shadowRoot.querySelectorAll('link[rel="stylesheet"]')
      Array.from(stylesheets).forEach((stylesheet) => {
        let href = stylesheet.getAttribute('href')
        Pantarei.stylesheets[href].then((style) => {
          let stylenode = document.importNode(style, true)
          this.shadowRoot.insertBefore(stylenode, stylesheet)
          ShadyCSS.applyStyle(this, this.shadowRoot)
        })
      })
      ShadyCSS.applyStyle(this, this.shadowRoot)

      // let nodes = this.shadowRoot.querySelectorAll('import-style[name]')
      // Array.from(nodes).forEach((node) => {
      //   let name = node.getAttribute('name')
      //   Pantarei.styles[name].then((style) => {
      //     let stylenode = document.importNode(style, true)
      //     this.shadowRoot.insertBefore(stylenode, node)
      //     ShadyCSS.applyStyle(this, this.shadowRoot)
      //   })
      // })

    }

    after_create () {}

    after_connect () {}

    detachedCallback () {}

    connectedCallback () {}

    disconnectedCallback () {}

    attributeChangedCallback () {}

  }

  Pantarei.Element = PantareiElement


  Pantarei.stylesheets = {}

  Pantarei.prepareTemplate = function (template, name) {
    if (typeof ShadyCSS === 'undefined') {
      return
    }
    ShadyCSS.prepareTemplate(template, name)

    let stylesheets = template.content.querySelectorAll('link[rel="stylesheet"]')

    Array.from(stylesheets).forEach((stylesheet) => {
      let href = stylesheet.getAttribute('href')

      Pantarei.stylesheets[href] = new Promise((resolve, reject) => {
        fetch(href)
          .then((response) => {
            return response.text()
          })
          .then((text) => {
            let template = document.createElement('template')
            let stylenode = document.createElement('style')
            template.content.appendChild(stylenode)
            stylenode.textContent = text
            ShadyCSS.prepareTemplate(template, name)
            stylenode = template.content.querySelector('style')
            resolve(stylenode)
          })
          .catch((err) => {
            reject(err)
          })
      })

    })
  }

  class TemplateElement extends HTMLElement {

    createdCallback () {
      let name = this.id
      let template = this.querySelector('template')
      template = document.importNode(template, true)
      Pantarei.templates[name] = template

      Pantarei.prepareTemplate(template, name)

      if (this.hasAttribute('selfy')) {
        document.registerElement(name, class extends Pantarei.Element {})
      }
      console.log('created', name)
    }

  }

  document.registerElement('template-element', TemplateElement)

  Pantarei.TemplateElement = TemplateElement

  class TemplateRepeat extends HTMLElement {

    createdCallback () {
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

      this._item_name = this.getAttribute('item') || 'item'
      this._index_name = this.getAttribute('index') || 'index'

      this._items = []
      this._clones = []

      this.style.display = 'none'
    }

    _create_clone (index) {
      let clone = this._node.cloneNode(true)
      this.parentNode.insertBefore(clone, this)
      this._container._parse_node(clone)
      this._clones[index] = clone
    }

    _render_clone (index, data) {
      let clone = this._clones[index]
      let clone_data = Object.assign({}, data)
      let item = this.items[index]
      clone_data[this._item_name] = item
      clone_data[this._index_name] = index
      this._container._render_node(clone, clone_data)
    }

    _remove_clone (index) {
      let clone = this._clones[index]
      clone.remove()
      this._clones[index] = null
    }

    render (data) {
      let old_items = this._items || []
      let new_items = this.items

      if (!Array.isArray(new_items)) {
        new_items = []
      }

      this.items = new_items.slice()

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
        for (let index = old_items_count; index < new_items_count; index++) {
          this._create_clone(index)
          this._render_clone(index, data)
        }
      }

      this._items = this.items
    }

  }

  document.registerElement('template-repeat', TemplateRepeat)

  Pantarei.TemplateRepeat = TemplateRepeat

  class TemplateIf extends HTMLElement {

    createdCallback () {
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
      // this._clone.render()
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

  document.registerElement('template-if', TemplateIf)

  Pantarei.TemplateIf = TemplateIf

  class TemplateText extends HTMLElement {

    createdCallback () {
      this._setup()
    }

    _setup () {
      this._node = document.createTextNode('')
      let directive = function (data) {
        this._node.textContent = this.text
      }
      this.directive = directive
      this.style.display = 'none'
    }

    attachedCallback () {
      this.parentNode.insertBefore(this._node, this)
    }

    render (data) {
      if (!this.directive) return
      this.directive.call(this, data)
    }

  }

  document.registerElement('template-text', TemplateText)

  Pantarei.TemplateText = TemplateText

  Pantarei.styles = {}

  class ImportStyle extends HTMLElement {

    createdCallback () {
      // let name = this.getAttribute('name')
      // let style = Pantarei.styles[name]
      // if (!style) {
      //   return
      // }
      // if (style._attached) {
      //   return
      // }
      // let node = document.importNode(style, true)
      // this.parentNode.insertBefore(node, this)
      // style._attached = true
      // this._style = style
    }

  }

  document.registerElement('import-style', ImportStyle)

  Pantarei.ImportStyle = ImportStyle

  class TemplateStyle extends HTMLElement {

    createdCallback () {
      let name = this.id
      Pantarei.styles[name] = new Promise((resolve, reject) => {
        HTMLImports.whenReady(() => {
          let template = this.querySelector('template')

          if (typeof ShadyCSS !== 'undefined') {
            ShadyCSS.prepareTemplate(template, name)
          }

          let style = template.content.querySelector('style')

          if (!style) {
            reject()
            return
          }

          resolve(style)
        })
      })
    }

  }

  document.registerElement('template-style', TemplateStyle)

  Pantarei.TemplateStyle = TemplateStyle

}())