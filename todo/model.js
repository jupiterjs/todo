steal('can/model',
	'jquery/lang/json').then(function() {

	// Basic Todo entry model
	// { text: 'todo', complete: false }
	can.Model('Todo', {

		// Implement local storage handling
		localStore: function(cb){
			var name = 'todos-jmvc',
				data = $.evalJSON( window.localStorage[name] || (window.localStorage[name] = '[]') ),
				res = cb.call(this, data);
			if(res !== false){
				can.each(data, function(i, todo) {
					delete todo.editing;
				});
				window.localStorage[name] = $.toJSON(data);
			}
		},

		findAll: function(params){
			var def = new can.Deferred();
			this.localStore(function(todos){
				var instances = [],
					self = this;
				can.each(todos, function(todo, i) {
					instances.push(new self(todo));
				});
				def.resolve({data: instances});
			})
			return def;
		},

		destroy: function(id){
			var def = new can.Deferred();
			this.localStore(function(todos){
				for (var i = 0; i < todos.length; i++) {
					if (todos[i].id === id) {
						todos.splice(i, 1);
						break;
					}
				}
				def.resolve({});
			});
			return def
		},

		create: function(attrs){
			var def = new can.Deferred();
			this.localStore(function(todos){
				attrs.id = attrs.id || parseInt(100000 *Math.random());
				todos.push(attrs);
			});
			def.resolve({id : attrs.id});
			return def
		},

		update: function(id, attrs){
			var def = new can.Deferred();
			this.localStore(function(todos){
				for (var i = 0; i < todos.length; i++) {
					if (todos[i].id === id) {
						var todo = todos[i];
						break;
					}
				}
				can.extend(todo, attrs);
			});
			def.resolve({});
			return def
		}

	},{});

	// List for Todos
	can.Model.List('Todo.List', {

		completed: function() {
			// Ensure this triggers on length change
			this.attr('length');

			var completed = 0;
			this.each(function(todo, i) {
				completed += todo.attr('complete') ? 1 : 0
			});
			return completed;
		},

		remaining: function() {
			return this.attr('length') - this.completed();
		},

		allComplete: function() {
			return this.attr('length') === this.completed();
		}
	});

});