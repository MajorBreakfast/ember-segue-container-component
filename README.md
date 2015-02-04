# Usage

The `segue-container-component` can animate between your ember components. 

Example:
``` Handlebars
{{segue-container
  component-name = componentName
  segue-for = segueFor
  
  blogPost—pinned-to-blog-post-pane = blogPost  
  areCommentsShown-from-blog-post—pane = areBlogPostCommentsShown

  searchTerm-to-search-pane = searchTerm
 }}
```

- `component-name` defines which component should be shown
- `segue-for` lets you define the transition between the old and the new component
- `[property name]-{pinned-to,to,from}-[component name]` define properties on the component
  - `pinned-to`: Change triggers animation, passed into `.create()` as inital value
  - `to`: Two-way binding (passed-in value wins), passed into `.create()` as inital value
  - `from`: Two-way binding (component's value wins)

# Installation and Setup

`jspm install ember-segue-container-component=github:MajorBreakfast/ember-segue-container-component`

``` JavaScript
import Ember from 'ember'
import SegueContainerComponent from 'ember-segue-container-component'

var App = Ember.Application.create({
  SegueContainerComponent
})
```

# Video

I did a talk on January 29th at the Ember Munich Meetup about this. The recording [is available on YouTube](http://youtu.be/Z-ZQBO6-f8Q).

# Q&A

**Can I contribute?**

Sure :)

**Why JavaScript controlled animations?**

I'm thinking about adding swipe based switching between components similiar to the back gesture on iOS. That's why I chose to define the animations via JS in favor of CSS animations or transitions.

**Why call it "segue", not "transition"?**

The word "transition" already refers to a route transition in the emberverse. "Animated transition" is too long, so I'm calling it "segue" like it's called in [Cocoa Touch](https://developer.apple.com/technologies/ios/cocoa-touch.html).

**Is ember-cli supported?**

No. Adding compatibility should be straightforward, however. Contributions are welcome!