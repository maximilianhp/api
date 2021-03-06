  /** @jsx React.DOM */
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

  var styleDisplayNone = {
    display: "None"
  }

  var River = React.createClass({displayName: "River",
    getInitialState: function(){
      return {events: [], skip: 0, limit: 50, showMore: true};      
    },

    fetchEventData: function() {
      var url = this.props.source + "?skip=" + this.state.skip + "&limit=" + this.state.limit;
      var self = this;
      $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        beforeSend: function(xhr){
          xhr.setRequestHeader('Authorization', eun);
        },
        success: function(result) {
          if (self.isMounted()) {
            self.setState({
              skip: self.state.skip + 50,
              limit: 50,
              events: self.state.events.concat(result),
              showMore: result.length === 50
            });
          }
        },
        error: function() {
          console.error('Problem while fetching timeline events!');
        }
      });
    },

    componentDidMount: function() {
      this.fetchEventData();
    },

    render: function() {
      var riverEvents = constructRiverData(this.state.events);
      var dateGroups = riverEvents.map(function(dateGroup){
        return React.createElement(DateGroup, {key: dateGroup.date, day: dateGroup.date, group: dateGroup.data});
      });
      return ( 
        React.createElement("div", null, 
          dateGroups, 
          this.state.showMore ? React.createElement(MoreButton, {clickHandler: this.fetchEventData}) : undefined
        )
      );
    }
  });

  var MoreButton = React.createClass({displayName: "MoreButton",
    render: function(){
      return (
        React.createElement("div", {className: "more_events_button_wrapper"}, 
          React.createElement("button", {className: "btn btn-default btn-lg rounded-button", onClick: this.props.clickHandler}, "More")
        )
        );
    }
  });

  var DateGroup = React.createClass({displayName: "DateGroup",
    render: function() {
      return ( 
        React.createElement("div", {className: "accordion-parent"}, 
        React.createElement("div", {className: "accordian-group-heading"}, this.props.day, " "), 
        React.createElement(TagGroupList, {groups: this.props.group})
        )
      );
    }
  });

  var TagGroupList = React.createClass({displayName: "TagGroupList",
    render: function() {
      var key = 0;
      var tagGroups = this.props.groups.map(function(group){
        return React.createElement(TagGroup, {key: ++key, icon: group.icon, title: group.title, from: group.from, to: group.to, chartUrl: group.chartUrl, events: group.events});
      });

      return (
        React.createElement("div", null, 
          tagGroups
        )
        );
    }
  });

  var TagGroup = React.createClass({displayName: "TagGroup",
    render: function() {
      return (
        React.createElement("div", {className: "accordion-container"}, 
          React.createElement(TagGroupTitle, {icon: this.props.icon, title: this.props.title, from: this.props.from, to: this.props.to, count: this.props.events.length}), 
          React.createElement(TagGroupContent, {chartUrl: this.props.chartUrl, events: this.props.events})
        )
        );
    }
  });

  var TagGroupTitle = React.createClass({displayName: "TagGroupTitle",
    handleClick: function(event) {
      var node = $(this.getDOMNode());
      var wasVisible = $(node).next(".ui-accordion-content").is(':visible');
      $(".ui-accordion-content:visible").slideUp(500);

      if (wasVisible) {
        $(node).next(".ui-accordion-content").slideUp(500);
      } else {
        $(node).next(".ui-accordion-content").slideDown(500);
      }
    },

    render: function() {
      return (
        React.createElement("div", {onClick: this.handleClick, className: "accordian-title-container"}, React.createElement("img", {className: "accordian-title-logo float-left", src: this.props.icon}), 
          React.createElement("div", {className: "accordian-heading float-left"}, 
            React.createElement("div", {className: "width-100 center-aligned"}, 
              React.createElement("h3", {className: "accordian-title"}, " ", this.props.title), 
              React.createElement("span", null, "From ", this.props.from, " to ", this.props.to)
            )
          ), 
          React.createElement("span", {className: "counter bold"}, this.props.count)
        )
        );
    }
  });

  var TagGroupContent = React.createClass({displayName: "TagGroupContent",
    getInitialState: function(){
      return {display: 'list'};
    },

    componentDidMount: function() {
      $($(this.getDOMNode())).find(".list-container-class").animate({
        width: "100%"
      }, 500);
    },

    handleClick: function(state) {
      var notSelected;
      if(state === 'list') {
        notSelected = 'graph';
      } else {
        notSelected = 'list';
      }
      this.setState({display: state, parent: this.getDOMNode() });
    },

    render: function() {
      return (
          React.createElement("div", {className: "ui-accordion-content"}, 
            React.createElement("div", {className: "accordian-title-logo float-left height-ten-pixle"}), 
            React.createElement("div", {className: "accordian-heading float-left"}, 
              React.createElement("span", {className: "list-graph-toggle-container"}, 
              React.createElement("a", {ref: "list", href: "#", onClick: this.handleClick.bind(this, 'list'), className: "graph-toggle-link border-right list-link active-link"}, 
                React.createElement("img", {src: "img/list-icon.png", className: "graph-toggle-icon"})
              ), 
              React.createElement("a", {ref: "graph", href: "#", onClick: this.handleClick.bind(this, 'graph'), className: "graph-toggle-link graph-link"}, 
                React.createElement("img", {src: "img/graph-icon.png", className: "graph-toggle-icon"})
              )
              )
              
            ), 
            React.createElement(ReactCSSTransitionGroup, {transitionName: "fade"}, 
              this.state.display == 'graph' ? React.createElement(EventsGraph, {parent: this.state.parent, chartUrl: this.props.chartUrl}) : React.createElement(EventsList, {parent: this.state.parent, events: this.props.events})
            )
          )
        );
    }
  });

  var EventsList = React.createClass({displayName: "EventsList",
    componentDidMount: function(){
      var parentNode = $(this.props.parent);

      $(parentNode).find('.list-link').addClass("active-link");
      $(parentNode).find('.graph-link').removeClass("active-link");
     
      $(parentNode).find(".graph-container-class").animate({
        width: "0px"
      }, 500);

      $(parentNode).find(".list-container-class").animate({
        width: "100%"
      }, 500);
    },

    render: function() {
      var key = 0;
      var events = this.props.events.map(function(event){
        return React.createElement(Event, {key: ++key, title: event.title, time: event.time, properties: event.properties});
      });

      return (
        React.createElement("div", {className: "clear-all list-container-class", id: "list-container"}, 
          events
        )
      );
    }
  });

  var Event = React.createClass({displayName: "Event",
    render: function(){
      return (
        React.createElement("div", {className: "details"}, 
          React.createElement("div", {className: "clear-all"}, 
            React.createElement("h4", {className: "list-title"}, this.props.title), 
            React.createElement("div", {className: "time-stamp"}, this.props.time)
          ), 
          React.createElement(PropertyList, {properties: this.props.properties})
        )
        );
    }
  });

  var PropertyList = React.createClass({displayName: "PropertyList",
    render: function() {
      var properties = this.props.properties.map(function(prop){
        return React.createElement(Property, {key: prop.name, name: prop.name, value: prop.value});
      });

      return (
        React.createElement("div", {className: "clear-all"}, 
          properties
        )
        );
    }
  });

  var Property = React.createClass({displayName: "Property",
    render: function(){
      return (
        React.createElement("div", null, 
          React.createElement("span", null, this.props.name, ":"), 
          React.createElement("span", null, " “", this.props.value, "”")
        )
        );
    }
  });

  var EventsGraph = React.createClass({displayName: "EventsGraph",
    componentDidMount: function(){
      var parentNode = $(this.props.parent);
      var graphNode = $(this.refs['graph-container'].getDOMNode());

      $(parentNode).find(".list-container-class").animate({
        width: "0px"
      }, 500);

      if ($(window).width() <= 460) {
        $(graphNode).animate({
          width: "100%"
        }, 500);
      } else {
        $(graphNode).animate({
          width: "91%"
        }, 500);
        // $(".graph-container-class").show();
        $(graphNode).css({
          "float": "none"
        });
      }
      $(parentNode).find('.graph-link').addClass("active-link");
      $(parentNode).find('.list-link').removeClass("active-link");
    },

    render:function(){
      return (
            React.createElement("div", {className: "clear-all"}, 
              React.createElement("div", {className: "accordian-title-logo float-left height-ten-pixle hide-on-mobile"}), 
              React.createElement("div", {ref: "graph-container", className: "clear-all graph-container-class accordian-heading righ-aligned", id: "graph-container"}, 
                
                React.createElement("iframe", {src: "", className: "graph-iframe", src: this.props.chartUrl})
              )
            )
        );
    }
  });

React.render(React.createElement(River, {source: "/v1/users/" + username + "/events"}), document.getElementById('river'));
