import Ember from 'ember'

/**
  Calls the `update()` method while the view's element exists.
  
  @mixin AnimationLoopMixin
*/
export default Ember.Mixin.create({
  startAnimationLoop: function() {
    var lastTime
    var raf = Ember.run.bind(this, function(time) {
      if (lastTime) {
        var dt = time - lastTime
        // Expected dt is 16ms, don't allow value greater than 100ms
        this.trigger('update', Math.min(dt, 100))
      }
      lastTime = time
      this.rafId = requestAnimationFrame(raf) // Next frame
    })
    this.rafId = requestAnimationFrame(raf)
  }.on('didInsertElement'),

  stopAnimationLoop: function() {
    cancelAnimationFrame(this.rafId)
  }.on('willDestroyElement')
})