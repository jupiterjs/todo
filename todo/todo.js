steal.css('todo')
	.plugins('jquery/model/list',
	'jquery/controller',
	'jquery/view/ejs',
	'jquery/lang/json').then(function($){

// a helper for retrieving JSON data from localStorage
var localStore = function(name, cb, self){
	var data = $.evalJSON( window.localStorage[name] || (window.localStorage[name] = "{}") ),
		res = cb.call(self, data);
	if(res !== false){
		window.localStorage[name] = $.toJSON(data);
	}
};

// A todo model for CRUDing todos.
$.Model('Todo',{
	findAll : function(ids, success, error){
		localStore("todos", function(todos){
			instances = [];
			for(var id in todos){
				if(!ids || !ids.length || $.inArray(id, ids)){
					instances.push( new this( todos[id]) )
				}
			}
			success && success(instances)
		}, this)
	},
	destroyAll : function(ids, success, error){
		localStore("todos",function(todos){
			$.each(ids, function(){
				delete todos[this]
			});
		});
		success();
	},
	destroy : function(id, success){
		localStore("todos",function(todos){
			delete[id]
		})
		success();
	},
	create : function(attrs, success, error){
		localStore("todos",function(todos){
			attrs.id = attrs.id || parseInt(100000 *Math.random())
			todos[attrs.id] = attrs;
		});
		success({id : attrs.id})
	},
	update : function(id, attrs, success){
		localStore("todos",function(todos){
			var todo = todos[id];
			$.extend(todo, attrs);
		});
		success({});
	}
},{});

// A list of todos.  
$.Model.List('Todo.List',{
	
	// A helper for making a list of completed todos.
	completed : function(){
		return this.grep(function(item){
			return item.complete === true;
		})
	}
});


// A todos widget
$.Controller('Todos',{
	
	//setup and finding
	init : function(){
		this.find(".create").val("")[0].focus();
		this.options.list.findAll();
	},
	
	//adds existing and created to the list
	"{list} add" : function(list, ev, items){
	 	this.find('#list').append("todosEJS",items)
	 	this.updateStats();
	},
	
	//creating
	".create keyup" : function(el, ev){
		if(ev.keyCode == 13){
			new Todo({
				text : el.val(),
				complete : false
			}).save(this.callback('created'));
			
			el.val("");
		}
	},
	"created" : function(todo){
		this.options.list.push(todo); //triggers 'add' on the list
	},
	
	//destroying
	".clear click" : function(){
		this.options.list.completed()
		.destroyAll(); //this is calling on the list, needs to be implemented
		//but confusing
	},
	
	
	".todo mouseover" : function(){
		//show delete
	},
	".todo .destroy click" : function(el){
		el.closest('.todo').model().destroy();
	},
	"{list} remove" : function(list, ev, items){
		items.elements(this.element).slideUp(function(){
			$(this).remove();
		});
		this.updateStats();
	},
	
	".todo-clear click" : function(){
		this.options.list.completed().destroyAll();
	},
	
	// Update
	
	".todo [name=complete] change" : function(el, ev){
		var todo = el.closest('.todo').model().update({
			complete : el.is(':checked')
		});
	},
	
	".todo dblclick" : function(el){
		var input = $("<input name='text' class='text'/>").val(el.model().text)
		el.html(input);
		input[0].focus();
	},
	".todo [name=text] focusout" : function(el, ev){
		var todo = el.closest('.todo').model().update({
			text : el.val()
		});
	},
	"{list} update" : function(list, ev, item){
		item.elements().html("todoEJS", item);
		this.updateStats();
		//update completed
	},
	updateStats : function(){
		var list = this.options.list,
			completed = list.completed().length;
		$("#todo-stats").html("statsEJS",{
			completed : completed,
			total : list.length,
			remaining : list.length - completed
		})
	}
})



$(function(){
	$("#todos").todos({list : new Todo.List()});
})


});