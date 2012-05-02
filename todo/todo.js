steal('can/control', 'can/view/ejs')
	.then('./model.js',
		'./styles/base.css',
		'./styles/todo.css')
	.then(function() {

	can.Control('Todos', {

		// Initialize the Todos list
		init : function(){
			// Render the Todos
			this.element.append(can.view('//todo/views/todo.ejs', {
				todos: this.options.todos
			}));

			// Clear the new todo field
			$('#new-todo').val('').focus();
		},

		// Listen for when a new Todo has been entered
		'#new-todo keyup' : function(el, ev){
			if(ev.keyCode == 13){
				new Todo({
					text : el.val(),
					complete : false
				}).save(function() {
					el.val('');
				});
			}
		},

		// Handle a newly created Todo
		'{Todo} created' : function(list, ev, item){
			this.options.todos.push(item);
		},

		// Listen for editing a Todo
		'.todo dblclick' : function(el, ev) {
			el.data('todo').attr('editing', true).save(function() {
				el.children('.edit').focus().select();
			});
		},

		// Update a todo
		updateTodo: function(el) {
			el.closest('.todo').data('todo')
				.attr({
					editing: false,
					text: el.val()
				}).save();
		},

		// Listen for an edited Todo
		'.todo .edit keyup' : function(el, ev){
			if(ev.keyCode == 13){
				this.updateTodo(el);
			}
		},
		'.todo .edit focusout' : function(el, ev) {
			this.updateTodo(el);
		},

		// Listen for the toggled completion of a Todo
		'.todo .toggle click' : function(el, ev) {
			el.closest('.todo').data('todo')
				.attr('complete', el.is(':checked'))
				.save();
		},

		// Listen for a removed Todo
		'.todo .destroy click' : function(el){
			el.closest('.todo').data('todo').destroy();
		},

		// Listen for toggle all completed Todos
		'#toggle-all click' : function(el, ev) {
			var toggle = el.prop('checked');
			can.each(this.options.todos, function(i, todo) {
				todo.attr('complete', toggle).save();
			});
		},

		// Listen for removing all completed Todos
		'#clear-completed click' : function() {
			for (var i = this.options.todos.length - 1, todo; i > -1 && (todo = this.options.todos[i]); i--) {
				todo.attr('complete') && todo.destroy();
			}
		}

	})

	// Initialize the app
	Todo.findAll({}, function(todos) {
		new Todos('#todoapp', {
			todos: todos
		});
	});

});
