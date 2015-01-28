import Ember from 'ember'
import './style.css!'
import AnimationLoopMixin from './animation-loop-mixin'

// ToDo: Make it a real Component, not just a ContainerView :)
export default Ember.ContainerView.extend(AnimationLoopMixin, {
  classNames: ['segue-container-component'],
  attributeBindings: ['style'],

  componentName: Ember.computed.alias('component-name'),
  segueFor: Ember.computed.alias('segue-for'),

  init() {
    this._super()

    this.currentMeta = this.createMetaFor(undefined)
    this.pushObject(this.currentMeta.component)
  },

  isDirty: false,
  makeDirty() { this.isDirty = true },

  observedProperties: [],
  didChangeComponentName: function() {
    this.makeDirty()

    // Remove old observers
    for (var name of this.observedProperties) {
      this.removeObserver(name, this, 'makeDirty')
    }
    this.observedProperties = []

    // Add observers
    var props = this.extractMatchingProperties(this.get('componentName'))
    for (var { name, type } of props) {
      if (type == 'pinned-to') {
        this.observedProperties.push(name)
        this.addObserver(name, this, 'makeDirty')
      }
    }
  }.observes('componentName').on('init'),

  extractMatchingProperties(componentName) {
    var props = []

    var propRegExp = new RegExp(`^(.*?)-(pinned-to|to|from)-${componentName}$`)
    var isPropNameABindingDefinitionRegExp = /Binding$/

    for (var name in this) {
      var [matches, foreignName, type] = propRegExp.exec(name) || []
      matches = matches && !foreignName.match(isPropNameABindingDefinitionRegExp)
      if (matches) { props.push({ name, foreignName, type }) }
    }

    return props
  },

  /*
    Creates a meta object. A meta is a simple object with the basic information
    for a component:
    - componentName
    - component
    - bindings

    @method createMetaFor
    @private
  */
  createMetaFor(componentName) {
    var options = { showcaseContainer: this }
    var bindings = []

    if (componentName) {
      var props = this.extractMatchingProperties(componentName)
      for (var { name, foreignName, type } of props) {
        switch(type) {
          case 'to': // To: Add to options and bindings
            options[foreignName] = this.get(name)
            bindings.push(Ember.Binding.from(`showcaseContainer.${name}`).to(foreignName))
            break
          case 'from': // From: Add to bindings with inverse direction
            bindings.push(Ember.Binding.from(foreignName).to(`showcaseContainer.${name}`))
            break
          case 'pinned-to': // Pinned to: Add to options, don't bind
            options[foreignName] = this.get(name) 
            break
        }
      }

      var containerLookup = this.container.lookup('component-lookup:main')
      var Component = containerLookup.lookupFactory(componentName)

      Ember.assert(`Didn't find component with name "${componentName}"`, Component)
    } else {
      var Component = Ember.Component
    }

    var component = this.createChildView(Component, options)
    
    return { componentName, component, bindings }
  },

  /*
    Animation states: 'idle', 'segueing'

    ```
          --- startSegueTo(bMeta) -->          ---------.
    'idle'                           'segueing'    updateSegue()
          <------- endSegue() -------          <--------.
    ```

    @property animationState
    @private 
  */
  animationState: 'idle',

  startSegueTo(bMeta) {
    Ember.assert('Expected animation state "idle"', this.animationState === 'idle')

    this.animationState = 'segueing'

    var aMeta = this.currentMeta

    this.aMeta = aMeta
    this.bMeta = bMeta
    this.currentSegue = this.get('segueFor')(aMeta, bMeta)
    this.currentMeta = null
    this.t = 0

    // A
    aMeta.component.trigger('deactivate')
    for (var binding of aMeta.bindings) { binding.disconnect(aMeta.component) }

    // B
    this.pushObject(bMeta.component)
    bMeta.component.one('didInsertElement', this, 'updateSegue')
  },

  endSegue() {
    Ember.assert('Expected animation state "segueing"', this.animationState === 'segueing')
    
    this.animationState = 'idle'

    var aMeta = this.aMeta
    var bMeta = this.bMeta

    // B
    for (var binding of bMeta.bindings) { binding.connect(bMeta.component) }
    bMeta.component.trigger('activate')

    // A
    this.shiftObject()

    this.aMeta = null
    this.bMeta = null
    this.currentSegue = null
    this.currentMeta = bMeta
    this.t = undefined
  },

  updateSegue() {
    Ember.assert('Expected animation state "segueing"', this.animationState === 'segueing')

    var t_ = this.currentSegue.curve(this.t)
    this.currentSegue.animate(t_, this.aMeta, this.bMeta)
  },

  /*
    Called once per frame.

    @method update
    @private
  */
  update(dt) {
    switch(this.animationState) {
      case 'idle':
        if (this.isDirty) {
          this.isDirty = false
          var meta = this.createMetaFor(this.get('componentName'))
          this.startSegueTo(meta)
        }
        break
      case 'segueing':
        this.t = Math.min(1, this.t + dt / this.currentSegue.duration)
        this.updateSegue()
        if (this.t === 1) { this.endSegue() } // End
        break
    }
  }
})
